import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { GraduationCap, UserCircle, Shield } from "lucide-react";
import { useState } from "react";

function HeaderLogo() {
  const [imageLoaded, setImageLoaded] = useState(false);

  return (
    <>
      <img
        src="/graphic1.jpg"
        alt="Logo"
        className={`h-16 w-16 object-contain ${imageLoaded ? "" : "hidden"}`}
        onLoad={() => setImageLoaded(true)}
        onError={() => setImageLoaded(false)}
      />
      {!imageLoaded && <GraduationCap className="h-12 w-12" />}
    </>
  );
}

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-16">
        <div className="mb-16 text-center">
          <div className="mb-6 flex justify-center">
            <div className="flex h-20 w-20 items-center justify-center rounded-lg bg-primary/10 text-primary-foreground">
              <HeaderLogo />
            </div>
          </div>
          <h1 className="mb-4 text-4xl font-bold tracking-tight md:text-5xl">
            Faith Immaculate Academy CBT System
          </h1>
          <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
            Modern examination platform for educational institutions. Take exams
            digitally with automatic grading and instant results.
          </p>
        </div>

        <div className="mx-auto grid max-w-5xl gap-6 md:grid-cols-2">
          <Card className="hover-elevate">
            <CardContent className="flex flex-col items-center p-8 text-center">
              <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <UserCircle className="h-10 w-10" />
              </div>
              <h2 className="mb-3 text-2xl font-semibold">Student Portal</h2>
              <p className="mb-6 text-muted-foreground">
                Access your exams and view your results in a distraction-free
                environment.
              </p>
              <Link href="/student-portal">
                <Button size="lg" className="w-full" data-testid="button-student-portal">
                  Enter as Student
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="hover-elevate">
            <CardContent className="flex flex-col items-center p-8 text-center">
              <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <Shield className="h-10 w-10" />
              </div>
              <h2 className="mb-3 text-2xl font-semibold">Admin Portal</h2>
              <p className="mb-6 text-muted-foreground">
                Manage exams, questions, and view comprehensive analytics and
                reports.
              </p>
              <Link href="/admin">
                <Button size="lg" className="w-full" data-testid="button-admin-portal">
                  Enter as Admin
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>

        <div className="mt-16 text-center">
          <p className="text-sm text-muted-foreground">
            Designed for primary and secondary educational institutions
          </p>
        </div>
      </div>
    </div>
  );
}
