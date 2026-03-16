module.exports = [
"[project]/app/auth-test/page.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>AuthTest
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$supabase$2f$ssr$2f$dist$2f$module$2f$index$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/node_modules/@supabase/ssr/dist/module/index.js [app-ssr] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$supabase$2f$ssr$2f$dist$2f$module$2f$createBrowserClient$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@supabase/ssr/dist/module/createBrowserClient.js [app-ssr] (ecmascript)");
'use client';
;
;
;
function AuthTest() {
    const [log, setLog] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])([]);
    const addLog = (msg)=>{
        console.log(msg);
        setLog((prev)=>[
                ...prev,
                `${new Date().toISOString().slice(11, 19)} → ${msg}`
            ]);
    };
    const testEnvVars = ()=>{
        addLog(`SUPABASE_URL = ${("TURBOPACK compile-time value", "https://iwjauurnmereismordlm.supabase.co") ?? "❌ MISSING"}`);
        addLog(`ANON_KEY = ${("TURBOPACK compile-time truthy", 1) ? "✅ present (" + String(("TURBOPACK compile-time value", "sb_publishable_6bagJVkNHnyIi0ihsPqTMA_WADTNdN2")).slice(0, 15) + "...)" : "TURBOPACK unreachable"}`);
    };
    const testSignUp = async ()=>{
        addLog("Starting email signup test...");
        try {
            const supabase = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$supabase$2f$ssr$2f$dist$2f$module$2f$createBrowserClient$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["createBrowserClient"])(("TURBOPACK compile-time value", "https://iwjauurnmereismordlm.supabase.co"), ("TURBOPACK compile-time value", "sb_publishable_6bagJVkNHnyIi0ihsPqTMA_WADTNdN2"));
            addLog("Supabase client created ✅");
            const { data, error } = await supabase.auth.signUp({
                email: `test${Date.now()}@proton.me`,
                password: "TestPassword123!"
            });
            if (error) {
                addLog(`❌ SignUp error: ${error.message} (code: ${error.status})`);
            } else {
                addLog(`✅ SignUp success! User ID: ${data.user?.id}`);
            }
        } catch (err) {
            addLog(`💥 Exception: ${err?.message}`);
        }
    };
    const testGoogle = async ()=>{
        addLog("Starting Google OAuth test...");
        try {
            const supabase = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$supabase$2f$ssr$2f$dist$2f$module$2f$createBrowserClient$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["createBrowserClient"])(("TURBOPACK compile-time value", "https://iwjauurnmereismordlm.supabase.co"), ("TURBOPACK compile-time value", "sb_publishable_6bagJVkNHnyIi0ihsPqTMA_WADTNdN2"));
            addLog("Supabase client created ✅");
            const { data, error } = await supabase.auth.signInWithOAuth({
                provider: "google",
                options: {
                    redirectTo: `${window.location.origin}/auth/callback`
                }
            });
            if (error) {
                addLog(`❌ Google OAuth error: ${error.message}`);
            } else {
                addLog(`✅ Google OAuth initiated. Redirect URL: ${data.url?.slice(0, 60)}...`);
                addLog("→ Browser should redirect to Google now...");
            }
        } catch (err) {
            addLog(`💥 Exception: ${err?.message}`);
        }
    };
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        style: {
            padding: "2rem",
            fontFamily: "monospace",
            maxWidth: "800px",
            margin: "0 auto"
        },
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h1", {
                style: {
                    marginBottom: "1rem"
                },
                children: "🔬 Supabase Auth Diagnostic"
            }, void 0, false, {
                fileName: "[project]/app/auth-test/page.tsx",
                lineNumber: 68,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                style: {
                    display: "flex",
                    gap: "1rem",
                    marginBottom: "2rem",
                    flexWrap: "wrap"
                },
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                        onClick: testEnvVars,
                        style: {
                            padding: "0.75rem 1.5rem",
                            background: "#4f46e5",
                            color: "white",
                            border: "none",
                            borderRadius: "8px",
                            cursor: "pointer",
                            fontSize: "1rem"
                        },
                        children: "1. Check Env Vars"
                    }, void 0, false, {
                        fileName: "[project]/app/auth-test/page.tsx",
                        lineNumber: 71,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                        onClick: testSignUp,
                        style: {
                            padding: "0.75rem 1.5rem",
                            background: "#059669",
                            color: "white",
                            border: "none",
                            borderRadius: "8px",
                            cursor: "pointer",
                            fontSize: "1rem"
                        },
                        children: "2. Test Email Signup"
                    }, void 0, false, {
                        fileName: "[project]/app/auth-test/page.tsx",
                        lineNumber: 77,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                        onClick: testGoogle,
                        style: {
                            padding: "0.75rem 1.5rem",
                            background: "#dc2626",
                            color: "white",
                            border: "none",
                            borderRadius: "8px",
                            cursor: "pointer",
                            fontSize: "1rem"
                        },
                        children: "3. Test Google OAuth"
                    }, void 0, false, {
                        fileName: "[project]/app/auth-test/page.tsx",
                        lineNumber: 83,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                        onClick: ()=>setLog([]),
                        style: {
                            padding: "0.75rem 1.5rem",
                            background: "#6b7280",
                            color: "white",
                            border: "none",
                            borderRadius: "8px",
                            cursor: "pointer",
                            fontSize: "1rem"
                        },
                        children: "Clear"
                    }, void 0, false, {
                        fileName: "[project]/app/auth-test/page.tsx",
                        lineNumber: 89,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/app/auth-test/page.tsx",
                lineNumber: 70,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                style: {
                    background: "#111",
                    color: "#22c55e",
                    padding: "1.5rem",
                    borderRadius: "8px",
                    minHeight: "300px"
                },
                children: log.length === 0 ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                    style: {
                        color: "#6b7280"
                    },
                    children: "Click a button above to run a test..."
                }, void 0, false, {
                    fileName: "[project]/app/auth-test/page.tsx",
                    lineNumber: 99,
                    columnNumber: 11
                }, this) : log.map((line, i)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        style: {
                            marginBottom: "0.25rem"
                        },
                        children: line
                    }, i, false, {
                        fileName: "[project]/app/auth-test/page.tsx",
                        lineNumber: 102,
                        columnNumber: 13
                    }, this))
            }, void 0, false, {
                fileName: "[project]/app/auth-test/page.tsx",
                lineNumber: 97,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                style: {
                    marginTop: "1rem",
                    color: "#6b7280",
                    fontSize: "0.85rem"
                },
                children: "Results also logged to browser Console (F12 → Console tab)"
            }, void 0, false, {
                fileName: "[project]/app/auth-test/page.tsx",
                lineNumber: 107,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/app/auth-test/page.tsx",
        lineNumber: 67,
        columnNumber: 5
    }, this);
}
}),
];

//# sourceMappingURL=app_auth-test_page_tsx_b56002a2._.js.map