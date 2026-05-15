import {
  AccountabilityInsight,
  AccountabilityWorkout,
  buildAccountabilityInsight,
  getWeeklyNarrative,
} from "@/lib/accountability";

type AiProvider = "gemini" | "openrouter";
type ConfiguredProvider = AiProvider | "auto" | "off";

export interface AccountabilityAiSummary {
  summary: string;
  provider: AiProvider | "rules";
  fallback: boolean;
}

interface SummaryContext {
  profile: {
    streak?: number | null;
    fitness_goal?: string | null;
    accountability_preferred_prompt_tone?: string | null;
  };
  workouts: AccountabilityWorkout[];
  insight: AccountabilityInsight;
}

interface ToneProfile {
  label: string;
  styleInstruction: string;
  sentenceInstruction: string;
  emphasisInstruction: string;
  bannedInstruction: string;
}

function getConfiguredProvider(): ConfiguredProvider {
  const provider = process.env.ACCOUNTABILITY_AI_PROVIDER?.trim().toLowerCase();
  if (provider === "gemini" || provider === "openrouter" || provider === "off" || provider === "auto") {
    return provider;
  }
  return "auto";
}

function buildRuleBasedSummary(context: SummaryContext): string {
  const tone = context.profile.accountability_preferred_prompt_tone ?? "direct";
  const opener = tone === "supportive"
    ? "You're building momentum, and the pattern is getting clearer."
    : tone === "intense"
      ? "The data is simple: consistency wins and hesitation breaks rhythm."
      : "Your check-ins already show a clear behavior pattern.";

  const focus = context.insight.focusGroupLabel
    ? `Your current focus is ${context.insight.focusGroupLabel.toLowerCase()}.`
    : "Your focus mix will get sharper as you log more activity.";

  const risk = context.insight.streakRisk === "critical"
    ? "Your streak needs immediate protection today."
    : context.insight.streakRisk === "watch"
      ? "Your streak is at risk if you skip today."
      : "Your streak is stable if you keep showing up.";

  return `${opener} ${getWeeklyNarrative(context.insight)} ${focus} ${risk} ${context.insight.recommendedAction}`;
}

function getToneProfile(tone: string | null | undefined): ToneProfile {
  switch (tone) {
    case "supportive":
      return {
        label: "supportive",
        styleInstruction: "Sound calm, encouraging, and steady. Acknowledge effort without sounding sentimental.",
        sentenceInstruction: "Use gentle, reassuring wording and one validating phrase.",
        emphasisInstruction: "Emphasize sustainability, confidence, and small wins that keep momentum alive.",
        bannedInstruction: "Do not use pressure, scolding, or harsh urgency.",
      };
    case "intense":
      return {
        label: "intense",
        styleInstruction: "Sound sharp, demanding, and performance-focused.",
        sentenceInstruction: "Use short, punchy sentences and decisive wording.",
        emphasisInstruction: "Emphasize consequences of drifting, protecting momentum, and acting today.",
        bannedInstruction: "Do not sound abusive, insulting, or extreme.",
      };
    default:
      return {
        label: "direct",
        styleInstruction: "Sound clear, pragmatic, and coach-like.",
        sentenceInstruction: "Use concise sentences with moderate urgency.",
        emphasisInstruction: "Emphasize the pattern in the data and one next concrete move.",
        bannedInstruction: "Do not sound vague, fluffy, or motivational for its own sake.",
      };
  }
}

function buildPrompt(context: SummaryContext): string {
  const toneProfile = getToneProfile(context.profile.accountability_preferred_prompt_tone);
  const recentWorkouts = context.workouts.slice(0, 8).map((workout) => ({
    activity: workout.activity_title || workout.type || "custom",
    created_at: workout.created_at,
    duration_minutes: workout.duration_minutes ?? null,
    energy_level: workout.energy_level ?? null,
    effort_level: workout.effort_level ?? null,
  }));

  return [
    "You are generating a short accountability summary for a fitness habit app user.",
    "Write 2 to 4 sentences, plain text only, no markdown, no bullets, no hype.",
    `Prompt tone: ${toneProfile.label}.`,
    toneProfile.styleInstruction,
    toneProfile.sentenceInstruction,
    toneProfile.emphasisInstruction,
    toneProfile.bannedInstruction,
    "Be specific, practical, and grounded in the user's real check-in data.",
    "Mention pattern, risk, and one next-best action.",
    "If the streak risk is critical or watch, make that explicit in the first two sentences.",
    "If the user has a strongest weekday or dominant activity, use it to make the recommendation feel specific.",
    "Do not mention blockchain, tokens, NFTs, or business context unless directly relevant.",
    "",
    "User profile:",
    JSON.stringify({
      streak: context.profile.streak ?? 0,
      fitness_goal: context.profile.fitness_goal ?? null,
    }),
    "",
    "Computed insight:",
    JSON.stringify({
      streakRisk: context.insight.streakRisk,
      weeklyCheckins: context.insight.weeklyCheckins,
      weeklyConsistency: context.insight.weeklyConsistency,
      consistencyScore: context.insight.consistencyScore,
      topActivityLabel: context.insight.topActivityLabel,
      topActivityCount: context.insight.topActivityCount,
      focusGroupLabel: context.insight.focusGroupLabel,
      averageDuration: context.insight.averageDuration,
      strongestDayLabel: context.insight.strongestDayLabel,
      recommendedAction: context.insight.recommendedAction,
      recoveryPrompt: context.insight.recoveryPrompt,
    }),
    "",
    "Recent workouts:",
    JSON.stringify(recentWorkouts),
  ].join("\n");
}

async function callGemini(prompt: string): Promise<string> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error("Missing GEMINI_API_KEY");
  const model = process.env.GEMINI_MODEL || "gemini-2.5-flash";

  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-goog-api-key": apiKey,
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [{ text: prompt }],
          },
        ],
      }),
      cache: "no-store",
    },
  );

  if (!res.ok) {
    throw new Error(`Gemini request failed (${res.status})`);
  }

  const data = await res.json() as {
    candidates?: Array<{
      content?: { parts?: Array<{ text?: string }> };
    }>;
  };

  const text = data.candidates?.[0]?.content?.parts?.map((part) => part.text || "").join("").trim();
  if (!text) throw new Error("Gemini returned no text");
  return text;
}

async function callOpenRouter(prompt: string): Promise<string> {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) throw new Error("Missing OPENROUTER_API_KEY");
  const model = process.env.OPENROUTER_MODEL || "openrouter/free";

  const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
      ...(process.env.OPENROUTER_HTTP_REFERER ? { "HTTP-Referer": process.env.OPENROUTER_HTTP_REFERER } : {}),
      ...(process.env.OPENROUTER_APP_TITLE ? { "X-Title": process.env.OPENROUTER_APP_TITLE } : {}),
    },
    body: JSON.stringify({
      model,
      messages: [
        {
          role: "system",
          content: "You generate concise, practical accountability summaries from fitness check-in data.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
    }),
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error(`OpenRouter request failed (${res.status})`);
  }

  const data = await res.json() as {
    choices?: Array<{
      message?: { content?: string };
    }>;
  };

  const text = data.choices?.[0]?.message?.content?.trim();
  if (!text) throw new Error("OpenRouter returned no text");
  return text;
}

function getProviderOrder(): AiProvider[] {
  const configured = getConfiguredProvider();
  if (configured === "gemini") return ["gemini"];
  if (configured === "openrouter") return ["openrouter"];
  return ["gemini", "openrouter"];
}

export async function generateAccountabilitySummary(contextInput: {
  profile: SummaryContext["profile"];
  workouts: AccountabilityWorkout[];
}): Promise<AccountabilityAiSummary> {
  const insight = buildAccountabilityInsight(contextInput.workouts);
  const context: SummaryContext = { ...contextInput, insight };

  if (getConfiguredProvider() === "off") {
    return {
      summary: buildRuleBasedSummary(context),
      provider: "rules",
      fallback: true,
    };
  }

  const prompt = buildPrompt(context);

  for (const provider of getProviderOrder()) {
    try {
      const summary = provider === "gemini"
        ? await callGemini(prompt)
        : await callOpenRouter(prompt);
      return { summary, provider, fallback: false };
    } catch {
      continue;
    }
  }

  return {
    summary: buildRuleBasedSummary(context),
    provider: "rules",
    fallback: true,
  };
}
