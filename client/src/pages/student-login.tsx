import { useState } from "react";
import { useLocation } from "wouter";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";

export default function StudentLoginPage() {
  const [, setLocation] = useLocation();
  const [name, setName] = useState("");
  const [studentId, setStudentId] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!name || !studentId) {
      setError("Please enter both name and student ID");
      return;
    }
    setLoading(true);
    try {
      await apiRequest("POST", "/api/students/login", { name, studentId });
      // on success, redirect to student portal
      setLocation("/student-portal");
    } catch (err: any) {
      setError(err?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="w-full max-w-md p-4">
        <Card>
          <CardContent>
            <h2 className="text-lg font-semibold mb-4">Student Login</h2>
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <Label htmlFor="name">Student Name</Label>
                <Input id="name" value={name} onChange={(e) => setName(e.target.value)} />
              </div>
              <div className="mb-4">
                <Label htmlFor="studentId">Student ID</Label>
                <Input id="studentId" value={studentId} onChange={(e) => setStudentId(e.target.value)} />
              </div>
              {error && <p className="text-destructive mb-4">{error}</p>}
              <div className="flex justify-end">
                <Button type="submit" disabled={loading}>
                  {loading ? "Logging in..." : "Login"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
