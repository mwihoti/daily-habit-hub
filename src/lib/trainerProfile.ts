export interface ParsedQualifications {
  certifications: string[];
  education: string | null;
  training_style: string | null;
  social: {
    instagram: string | null;
    youtube: string | null;
    website: string | null;
  };
}

export function parseQualifications(bio: string | null): {
  cleanBio: string | null;
  qualifications: ParsedQualifications | null;
} {
  if (!bio) return { cleanBio: null, qualifications: null };
  const match = bio.match(/<!--qualifications:([\s\S]+?)-->$/);
  if (!match) return { cleanBio: bio, qualifications: null };

  try {
    return {
      cleanBio: bio.replace(/\n\n<!--qualifications:[\s\S]+-->$/, "").trim(),
      qualifications: JSON.parse(match[1]) as ParsedQualifications,
    };
  } catch {
    return { cleanBio: bio, qualifications: null };
  }
}
