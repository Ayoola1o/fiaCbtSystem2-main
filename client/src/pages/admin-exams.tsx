import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { Plus, Clock, BookOpen, Eye, Pencil, Trash2 } from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { Exam, Question } from "@shared/schema";

export default function AdminExams() {
  const { toast } = useToast();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [selectedExam, setSelectedExam] = useState<Exam | null>(null);

  const { data: exams, isLoading } = useQuery<Exam[]>({
    queryKey: ["/api/exams"],
  });

  const { data: questions } = useQuery<Question[]>({
    queryKey: ["/api/questions"],
  });

  const deleteExamMutation = useMutation({
    mutationFn: (examId: string) => apiRequest("DELETE", `/api/exams/${examId}`, {}),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/exams"] });
      toast({
        title: "Exam deleted",
        description: "The exam has been successfully deleted.",
      });
    },
  });

  const toggleExamMutation = useMutation({
    mutationFn: ({ examId, isActive }: { examId: string; isActive: boolean }) =>
      apiRequest("PATCH", `/api/exams/${examId}`, { isActive }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/exams"] });
    },
  });

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="mb-2 text-3xl font-bold">Exams</h1>
          <p className="text-muted-foreground">
            Create and manage your examination papers
          </p>
        </div>
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button data-testid="button-create-exam">
              <Plus className="mr-2 h-4 w-4" />
              Create Exam
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <ExamForm
              questions={questions || []}
              onSuccess={() => {
                setIsCreateOpen(false);
                queryClient.invalidateQueries({ queryKey: ["/api/exams"] });
              }}
            />
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-32 w-full" />
          ))}
        </div>
      ) : exams && exams.length > 0 ? (
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Exam Title</TableHead>
                <TableHead>Subject</TableHead>
                <TableHead>Class Level</TableHead>
                <TableHead>Duration</TableHead>
                <TableHead>Questions</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {exams.map((exam) => (
                <TableRow key={exam.id} data-testid={`row-exam-${exam.id}`}>
                  <TableCell className="font-medium">{exam.title}</TableCell>
                  <TableCell>
                    <Badge variant="secondary">{exam.subject}</Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{exam.classLevel}</Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <span>{exam.duration} mins</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <BookOpen className="h-4 w-4 text-muted-foreground" />
                      <span>{exam.questionIds.length}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={exam.isActive}
                        onCheckedChange={(checked) =>
                          toggleExamMutation.mutate({
                            examId: exam.id,
                            isActive: checked,
                          })
                        }
                        data-testid={`switch-active-${exam.id}`}
                      />
                      <span className="text-sm text-muted-foreground">
                        {exam.isActive ? "Active" : "Inactive"}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Link href={`/admin/exams/${exam.id}`}>
                        <Button
                          variant="ghost"
                          size="icon"
                          data-testid={`button-view-${exam.id}`}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      </Link>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() =>
                          deleteExamMutation.mutate(exam.id)
                        }
                        data-testid={`button-delete-${exam.id}`}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      ) : (
        <Card>
          <CardContent className="flex flex-col items-center py-12 text-center">
            <BookOpen className="mb-4 h-12 w-12 text-muted-foreground" />
            <h3 className="mb-2 text-lg font-semibold">No Exams Yet</h3>
            <p className="mb-4 text-sm text-muted-foreground">
              Get started by creating your first exam.
            </p>
            <Button onClick={() => setIsCreateOpen(true)} data-testid="button-create-first-exam">
              <Plus className="mr-2 h-4 w-4" />
              Create First Exam
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function ExamForm({
  questions,
  onSuccess,
}: {
  questions: Question[];
  onSuccess: () => void;
}) {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    subject: "",
    duration: 60,
    passingScore: 60,
    questionIds: [] as string[],
    classLevel: "JSS1",
    numberOfQuestionsToDisplay: undefined as number | undefined,
  });
  const [useSubjectSelectionLogic, setUseSubjectSelectionLogic] = useState(false);
  const [assignRandomQuestions, setAssignRandomQuestions] = useState(false);

  const availableQuestions = questions.filter((q) =>
    (formData.subject ? q.subject === formData.subject : true) &&
    (formData.classLevel ? q.classLevel === formData.classLevel : true)
  );

  const createExamMutation = useMutation({
    mutationFn: (data: typeof formData) => apiRequest("POST", "/api/exams", { ...data, assignRandomQuestions }),
    onSuccess: () => {
      toast({
        title: "Exam created",
        description: "The exam has been successfully created.",
      });
      onSuccess();
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create exam. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // If admin requested server-side selection by setting numberOfQuestionsToDisplay (>0),
    // allow creating the exam even if no questionIds were selected.
    const wantsServerSelection = !!formData.numberOfQuestionsToDisplay && formData.numberOfQuestionsToDisplay > 0;

    if (!wantsServerSelection && formData.questionIds.length === 0) {
      toast({
        title: "No questions selected",
        description: "Please select at least one question for the exam or set 'Number of Questions to Display'.",
        variant: "destructive",
      });
      return;
    }

    const dataToSubmit: any = { ...formData };
    if (!dataToSubmit.numberOfQuestionsToDisplay) {
      delete dataToSubmit.numberOfQuestionsToDisplay;
    }

    // If using server selection, remove questionIds so server will pick from the question bank
    if (wantsServerSelection) {
      delete dataToSubmit.questionIds;
    }

    createExamMutation.mutate(dataToSubmit);
  };

  const toggleQuestion = (questionId: string) => {
    setFormData((prev) => ({
      ...prev,
      questionIds: prev.questionIds.includes(questionId)
        ? prev.questionIds.filter((id) => id !== questionId)
        : [...prev.questionIds, questionId],
    }));
  };

  const selectAllQuestions = () => {
    setFormData((prev) => ({
      ...prev,
      questionIds: availableQuestions.map((q) => q.id),
    }));
  };

  return (
    <form onSubmit={handleSubmit}>
      <DialogHeader>
        <DialogTitle>Create New Exam</DialogTitle>
        <DialogDescription>
          Fill in the details to create a new examination
        </DialogDescription>
      </DialogHeader>
      <div className="space-y-6 py-6">
        <div className="grid gap-6 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="classLevel">Class Level *</Label>
            <select
              id="classLevel"
              value={formData.classLevel}
              onChange={e => setFormData({ ...formData, classLevel: e.target.value, subject: '', questionIds: [] })}
              required
              className="border rounded px-2 py-1 w-full"
              data-testid="select-exam-class-level"
            >
              <option value="JSS1">JSS1</option>
              <option value="JSS2">JSS2</option>
              <option value="JSS3">JSS3</option>
              <option value="SS1">SS1</option>
              <option value="SS2">SS2</option>
              <option value="SS3">SS3</option>
              <option value="WAEC">WAEC</option>
              <option value="NECO">NECO</option>
              <option value="GCE WAEC">GCE WAEC</option>
              <option value="GCE NECO">GCE NECO</option>
            </select>
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="title">Exam Title *</Label>
          <Input
            id="title"
            placeholder="e.g., Mathematics Final Exam"
            value={formData.title}
            onChange={(e) =>
              setFormData({ ...formData, title: e.target.value })
            }
            required
            data-testid="input-exam-title"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            placeholder="Brief description of the exam"
            value={formData.description}
            onChange={(e) =>
              setFormData({ ...formData, description: e.target.value })
            }
            data-testid="textarea-exam-description"
          />
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="subject">Subject *</Label>
            <select
              id="subject"
              value={formData.subject}
              onChange={e => setFormData({ ...formData, subject: e.target.value, questionIds: [] })}
              required
              className="border rounded px-2 py-1 w-full"
              data-testid="select-exam-subject"
            >
              <option value="">Select Subject</option>
              {Array.from(new Set(questions.filter(q => q.classLevel === formData.classLevel).map(q => q.subject))).map(subject => (
                <option key={subject} value={subject}>{subject}</option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="duration">Duration (minutes) *</Label>
            <Input
              id="duration"
              type="number"
              min="1"
              value={formData.duration}
              onChange={(e) =>
                setFormData({ ...formData, duration: parseInt(e.target.value) })
              }
              required
              data-testid="input-exam-duration"
            />
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="passingScore">Passing Score (%) *</Label>
            <Input
              id="passingScore"
              type="number"
              min="0"
              max="100"
              value={formData.passingScore}
              onChange={(e) =>
                setFormData({ ...formData, passingScore: parseInt(e.target.value) })
              }
              required
              data-testid="input-exam-passing-score"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="numberOfQuestionsToDisplay">Number of Questions to Display</Label>
            <Input
              id="numberOfQuestionsToDisplay"
              type="number"
              min="0"
              placeholder={`Defaults to all ${formData.questionIds.length} selected questions`}
              value={formData.numberOfQuestionsToDisplay}
              onChange={(e) =>
                setFormData({ ...formData, numberOfQuestionsToDisplay: e.target.value ? parseInt(e.target.value) : undefined })
              }
              data-testid="input-exam-questions-to-display"
            />
            <p className="text-sm text-muted-foreground">
              If left blank or 0, all selected questions will be used. Otherwise, a random selection of this number of questions will be presented to the student from the question bank.
            </p>
          </div>
        </div>

        <div className="space-y-2">
          <Label>Question Selection Logic</Label>
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="subject-selection-logic"
              checked={useSubjectSelectionLogic}
              onChange={e => setUseSubjectSelectionLogic(e.target.checked)}
              className="mr-2"
            />
            <Label htmlFor="subject-selection-logic">Enable: Question Bank → Select Subject → Select Questions by Subject → Sort Questions by Subject</Label>
          </div>
        </div>

        <div className="space-y-2">
          <Label>Randomize Questions</Label>
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="assign-random-questions"
              checked={assignRandomQuestions}
              onChange={e => setAssignRandomQuestions(e.target.checked)}
              className="mr-2"
            />
            <Label htmlFor="assign-random-questions">Assign random questions to each student</Label>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label>Select Questions * ({availableQuestions.length} available)</Label>
            <div>
              <Button variant="ghost" size="sm" onClick={selectAllQuestions} data-testid="button-select-all-questions">Select All</Button>
            </div>
          </div>
          <div className="max-h-64 space-y-2 overflow-y-auto rounded-md border p-4">
            {useSubjectSelectionLogic ? (
              <>
                <div className="mb-2">
                  <Label>Filter by Subject:</Label>
                  <select
                    value={formData.subject}
                    onChange={e => setFormData({ ...formData, subject: e.target.value })}
                    className="ml-2 border rounded px-2 py-1"
                  >
                    <option value="">All Subjects</option>
                    {Array.from(new Set(questions.map(q => q.subject))).map(subject => (
                      <option key={subject} value={subject}>{subject}</option>
                    ))}
                  </select>
                </div>
                {availableQuestions.length > 0 ? (
                  availableQuestions
                    .sort((a, b) => a.subject.localeCompare(b.subject))
                    .map((question) => (
                      <div key={question.id} className="flex items-start gap-3 rounded-md border p-3 hover-elevate">
                        <input
                          type="checkbox"
                          id={`question-${question.id}`}
                          checked={formData.questionIds.includes(question.id)}
                          onChange={() => toggleQuestion(question.id)}
                          className="mt-1"
                          data-testid={`checkbox-question-${question.id}`}
                        />
                        <Label htmlFor={`question-${question.id}`} className="flex-1 cursor-pointer text-sm">
                          <div className="flex items-center gap-2">
                            <Badge variant="secondary" className="text-xs">{question.subject}</Badge>
                            <Badge variant="outline" className="text-xs">{question.difficulty}</Badge>
                          </div>
                          <p className="mt-1">{question.questionText}</p>
                        </Label>
                      </div>
                    ))
                ) : (
                  <p className="text-center text-sm text-muted-foreground">No questions available for the selected Class Level and Subject.</p>
                )}
              </>
            ) : (
              availableQuestions.length > 0 ? (
                availableQuestions.map((question) => (
                  <div key={question.id} className="flex items-start gap-3 rounded-md border p-3 hover-elevate">
                    <input
                      type="checkbox"
                      id={`question-${question.id}`}
                      checked={formData.questionIds.includes(question.id)}
                      onChange={() => toggleQuestion(question.id)}
                      className="mt-1"
                      data-testid={`checkbox-question-${question.id}`}
                    />
                    <Label htmlFor={`question-${question.id}`} className="flex-1 cursor-pointer text-sm">
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary" className="text-xs">{question.subject}</Badge>
                        <Badge variant="outline" className="text-xs">{question.difficulty}</Badge>
                      </div>
                      <p className="mt-1">{question.questionText}</p>
                    </Label>
                  </div>
                ))
              ) : (
                <p className="text-center text-sm text-muted-foreground">No questions available for the selected Class Level and Subject.</p>
              )
            )}
          </div>
          <p className="text-sm text-muted-foreground">{formData.questionIds.length} question(s) selected</p>
        </div>
      </div>
      <DialogFooter>
        <Button
          type="submit"
          disabled={createExamMutation.isPending}
          data-testid="button-submit-exam"
        >
          {createExamMutation.isPending ? "Creating..." : "Create Exam"}
        </Button>
      </DialogFooter>
    </form>
  );
}

