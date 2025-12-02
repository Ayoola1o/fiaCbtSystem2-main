import React, { useState } from "react";
import { useLocation } from "wouter";
import { useParams } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";

export default function AdminExamDetails() {
  const { id } = useParams();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const { data: exam, isLoading } = useQuery<any>({
    queryKey: ["/api/exams", id],
  });

  const [formData, setFormData] = useState<any>(null);

  // Set initial form data when exam loads
  React.useEffect(() => {
    if (exam) setFormData(exam);
  }, [exam]);

  const updateExamMutation = useMutation({
    mutationFn: (data: any) => apiRequest("PATCH", `/api/exams/${id}`, data),
    onSuccess: () => {
      toast({ title: "Exam updated", description: "Exam settings updated." });
      queryClient.invalidateQueries({ queryKey: ["/api/exams"] });
      setLocation("/admin/exams");
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to update exam.", variant: "destructive" });
    },
  });

  if (isLoading || !formData) return <div>Loading...</div>;

  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle>Exam Details</CardTitle>
        </CardHeader>
        <CardContent>
          <form
            onSubmit={e => {
              e.preventDefault();
              updateExamMutation.mutate(formData);
            }}
            className="space-y-6"
          >
            <div className="space-y-2">
              <Label htmlFor="title">Exam Title</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={e => setFormData({ ...formData, title: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description || ""}
                onChange={e => setFormData({ ...formData, description: e.target.value })}
              />
            </div>
            <div className="grid gap-6 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="subject">Subject</Label>
                <Input
                  id="subject"
                  value={formData.subject}
                  onChange={e => setFormData({ ...formData, subject: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="classLevel">Class Level</Label>
                <Input
                  id="classLevel"
                  value={formData.classLevel}
                  onChange={e => setFormData({ ...formData, classLevel: e.target.value })}
                  required
                />
              </div>
            </div>
            <div className="grid gap-6 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="duration">Duration (minutes)</Label>
                <Input
                  id="duration"
                  type="number"
                  min="1"
                  value={formData.duration}
                  onChange={e => setFormData({ ...formData, duration: parseInt(e.target.value) })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="passingScore">Passing Score (%)</Label>
                <Input
                  id="passingScore"
                  type="number"
                  min="0"
                  max="100"
                  value={formData.passingScore}
                  onChange={e => setFormData({ ...formData, passingScore: parseInt(e.target.value) })}
                  required
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Questions</Label>
              <Badge variant="secondary">{formData.questionIds?.length || 0} questions</Badge>
            </div>
            <div className="flex gap-2">
              <Button type="submit" disabled={updateExamMutation.isPending}>
                {updateExamMutation.isPending ? "Updating..." : "Update Exam"}
              </Button>
              <Button type="button" variant="outline" onClick={() => setLocation("/admin/exams")}>Cancel</Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
