"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { TrendingUp, Target, Zap, Sparkles } from "lucide-react";

export default function Home() {
  const t = useTranslations();
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [signupEmail, setSignupEmail] = useState("");
  const [signupPassword, setSignupPassword] = useState("");
  const [signupName, setSignupName] = useState("");

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // Todo
    console.log("Login:", { email: loginEmail, password: loginPassword });
  };

  const handleSignup = (e: React.FormEvent) => {
    e.preventDefault();
    // Todo
    console.log("Signup:", { name: signupName, email: signupEmail, password: signupPassword });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-950 dark:via-slate-900 dark:to-indigo-950 p-4">
      <div className="w-full max-w-6xl grid lg:grid-cols-2 gap-8 items-center">
        {/* Left side - Branding and features */}
        <div className="hidden lg:block space-y-8">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="relative">
                <TrendingUp className="w-10 h-10 text-indigo-600 dark:text-indigo-400" />
                <Sparkles className="w-5 h-5 text-yellow-500 absolute -top-1 -right-1 animate-pulse" />
              </div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400 bg-clip-text text-transparent">
                Ascent
              </h1>
            </div>
            <p className="text-xl text-slate-600 dark:text-slate-300 font-medium">
              {t("auth.features.title")}
            </p>
            <p className="text-slate-500 dark:text-slate-400">
              {t("auth.features.description")}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4 pt-8">
            <div className="space-y-2 p-4 rounded-lg bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm border border-slate-200/50 dark:border-slate-700/50">
              <Target className="w-6 h-6 text-indigo-600 dark:text-indigo-400 mb-2" />
              <h3 className="font-semibold text-slate-900 dark:text-slate-100">
                {t("auth.features.setGoals.title")}
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                {t("auth.features.setGoals.description")}
              </p>
            </div>
            <div className="space-y-2 p-4 rounded-lg bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm border border-slate-200/50 dark:border-slate-700/50">
              <Zap className="w-6 h-6 text-yellow-500 mb-2" />
              <h3 className="font-semibold text-slate-900 dark:text-slate-100">
                {t("auth.features.earnXP.title")}
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                {t("auth.features.earnXP.description")}
              </p>
            </div>
            <div className="space-y-2 p-4 rounded-lg bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm border border-slate-200/50 dark:border-slate-700/50">
              <TrendingUp className="w-6 h-6 text-green-600 dark:text-green-400 mb-2" />
              <h3 className="font-semibold text-slate-900 dark:text-slate-100">
                {t("auth.features.trackStreaks.title")}
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                {t("auth.features.trackStreaks.description")}
              </p>
            </div>
            <div className="space-y-2 p-4 rounded-lg bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm border border-slate-200/50 dark:border-slate-700/50">
              <Sparkles className="w-6 h-6 text-purple-600 dark:text-purple-400 mb-2" />
              <h3 className="font-semibold text-slate-900 dark:text-slate-100">
                {t("auth.features.visualize.title")}
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                {t("auth.features.visualize.description")}
              </p>
            </div>
          </div>
        </div>

        {/* Right side - Login/Signup form */}
        <div className="w-full max-w-md mx-auto">
          <Card className="border-slate-200/50 dark:border-slate-800 shadow-xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm">
            <CardHeader className="space-y-1 pb-6">
              <div className="flex items-center justify-center gap-2 mb-4 lg:hidden">
                <TrendingUp className="w-8 h-8 text-indigo-600 dark:text-indigo-400" />
                <CardTitle className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400 bg-clip-text text-transparent">
                  Ascent
                </CardTitle>
              </div>
              <CardTitle className="text-2xl font-bold text-center">
                {t("auth.welcome")}
              </CardTitle>
              <CardDescription className="text-center">
                {t("auth.subtitle")}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="login" className="w-full">
                <TabsList className="grid w-full grid-cols-2 mb-6">
                  <TabsTrigger value="login">{t("auth.signIn")}</TabsTrigger>
                  <TabsTrigger value="signup">{t("auth.signUp")}</TabsTrigger>
                </TabsList>

                <TabsContent value="login" className="space-y-4">
                  <form onSubmit={handleLogin} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="login-email">{t("auth.email")}</Label>
                      <Input
                        id="login-email"
                        type="email"
                        placeholder={t("auth.emailPlaceholder")}
                        value={loginEmail}
                        onChange={(e) => setLoginEmail(e.target.value)}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="login-password">{t("auth.password")}</Label>
                      <Input
                        id="login-password"
                        type="password"
                        placeholder={t("auth.passwordPlaceholder")}
                        value={loginPassword}
                        onChange={(e) => setLoginPassword(e.target.value)}
                        required
                      />
                    </div>
                    <Button type="submit" className="w-full" size="lg">
                      {t("auth.signIn")}
                    </Button>
                  </form>
                </TabsContent>

                <TabsContent value="signup" className="space-y-4">
                  <form onSubmit={handleSignup} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="signup-name">{t("auth.name")}</Label>
                      <Input
                        id="signup-name"
                        type="text"
                        placeholder={t("auth.namePlaceholder")}
                        value={signupName}
                        onChange={(e) => setSignupName(e.target.value)}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="signup-email">{t("auth.email")}</Label>
                      <Input
                        id="signup-email"
                        type="email"
                        placeholder={t("auth.emailPlaceholder")}
                        value={signupEmail}
                        onChange={(e) => setSignupEmail(e.target.value)}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="signup-password">{t("auth.password")}</Label>
                      <Input
                        id="signup-password"
                        type="password"
                        placeholder={t("auth.passwordPlaceholder")}
                        value={signupPassword}
                        onChange={(e) => setSignupPassword(e.target.value)}
                        required
                      />
                    </div>
                    <Button type="submit" className="w-full" size="lg">
                      {t("auth.createAccount")}
                    </Button>
                  </form>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}