import { useMemo, useState, useEffect } from "react";
import Layout from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { saveTest } from "@/lib/storage";
import { QuestionEntry, Subject, TestRecord, computeTestAggregates } from "@shared/api";
import { useNavigate } from "react-router-dom";

const SUBJECTS: Subject[] = ["Physics", "Chemistry", "Biology"];

const CHAPTERS: Record<Subject, string[]> = {
  Physics: [
    "Mechanics",
    "Waves & Optics",
    "Thermodynamics",
    "Electrostatics",
    "Current Electricity",
    "Magnetism",
    "Modern Physics",
    "Units & Dimensions",
  ],
  Chemistry: [
    "Physical Chemistry",
    "Organic Chemistry",
    "Inorganic Chemistry",
    "Atomic Structure",
    "Chemical Bonding",
    "Thermodynamics",
    "Equilibrium",
    "Electrochemistry",
  ],
  Biology: [
    "Diversity in Living World",
    "Human Physiology",
    "Plant Physiology",
    "Genetics & Evolution",
    "Ecology & Environment",
    "Reproduction",
    "Biotechnology",
    "Cell Structure",
  ],
};

export default function Index() {
  const navigate = useNavigate();
  const [subject, setSubject] = useState<Subject>("Physics");
  const [count, setCount] = useState<number>(0);
  const [questions, setQuestions] = useState<QuestionEntry[]>(() =>
    Array.from({ length: 0 }, (_, i) => ({ number: i + 1, chapter: "Mixed", status: "not_attempted" as const })),
  );

  const availableChapters = useMemo(() => ["Mixed", ...CHAPTERS[subject]], [subject]);

  // When subject changes, reset chapters not present to "Mixed"
  useEffect(() => {
    setQuestions((prev) =>
      prev.map((q) => (availableChapters.includes(q.chapter) ? q : { ...q, chapter: "Mixed" }))
    );
  }, [subject]);

  const totals = useMemo(() => computeTestAggregates(questions), [questions]);

  function regenerate(n: number) {
    setQuestions((prev) => {
      const arr = Array.from({ length: n }, (_, i) => prev[i] ?? { number: i + 1, chapter: "Mixed", status: "not_attempted" as const });
      return arr.map((q, i) => ({ ...q, number: i + 1 }));
    });
  }

  function handleCountChange(v: string) {
    const n = Math.max(1, Math.min(200, Number(v) || 0));
    setCount(n);
    regenerate(n);
  }

  function updateQuestion(idx: number, patch: Partial<QuestionEntry>) {
    setQuestions((prev) => prev.map((q, i) => (i === idx ? { ...q, ...patch } : q)));
  }

  async function saveCurrentTest() {
    try {
      const agg = computeTestAggregates(questions);
      const record: TestRecord = {
        id: crypto.randomUUID(),
        subject,
        questionCount: questions.length,
        questions,
        dateISO: new Date().toISOString(),
        score: agg.score,
        correct: agg.correct,
        wrong: agg.wrong,
        notAttempted: agg.notAttempted,
        byChapter: agg.byChapter,
      };
      await saveTest(record);
      navigate("/history");
    } catch (error) {
      console.error('Failed to save test:', error);
      // You could add a toast notification here to inform the user
    }
  }

  return (
    <Layout>
      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>New Test</span>
              <span className="text-sm font-normal text-muted-foreground">{new Date().toLocaleString()}</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="space-y-2">
                <Label>Subject</Label>
                <Select value={subject} onValueChange={(v) => setSubject(v as Subject)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select subject" />
                  </SelectTrigger>
                  <SelectContent>
                    {SUBJECTS.map((s) => (
                      <SelectItem key={s} value={s}>
                        {s}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Number of Questions</Label>
                <Input type="number" min={1} max={200} value={count} onChange={(e) => handleCountChange(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Total Score</Label>
                <div className="h-10 rounded-md border bg-muted/30 px-3 py-2 text-sm grid place-items-center sm:place-items-start">
                  <span>
                    {totals.score} ({totals.correct}C, {totals.wrong}W, {totals.notAttempted}NA)
                  </span>
                </div>
              </div>
            </div>

            <div className="rounded-lg border bg-card">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-14">#</TableHead>
                    <TableHead>Chapter</TableHead>
                    <TableHead className="w-60">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {questions.map((q, idx) => (
                    <TableRow key={q.number}>
                      <TableCell className="font-mono">{q.number}</TableCell>
                      <TableCell>
                        <Select value={q.chapter} onValueChange={(v) => updateQuestion(idx, { chapter: v })}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select chapter" />
                          </SelectTrigger>
                          <SelectContent>
                            {availableChapters.map((c) => (
                              <SelectItem key={c} value={c}>
                                {c}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell>
                        <Select value={q.status} onValueChange={(v) => updateQuestion(idx, { status: v as QuestionEntry["status"] })}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="correct">Correct (+4)</SelectItem>
                            <SelectItem value="wrong">Wrong (-1)</SelectItem>
                            <SelectItem value="not_attempted">Not Attempted (0)</SelectItem>
                          </SelectContent>
                        </Select>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            <div className="flex items-center justify-end gap-3">
              <Button variant="secondary" onClick={() => regenerate(count)}>Reset</Button>
              <Button onClick={saveCurrentTest}>Save Test</Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Breakdown</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-md bg-primary/5 p-4 text-sm">
              <p className="font-medium">Subject: {subject}</p>
              <p>Questions: {questions.length}</p>
              <p>
                Score: <span className="font-semibold">{totals.score}</span>
              </p>
              <p>
                Accuracy: {questions.length ? Math.round((totals.correct / questions.length) * 100) : 0}%
              </p>
            </div>
            <div className="space-y-2">
              {Object.entries(totals.byChapter).length === 0 && (
                <p className="text-sm text-muted-foreground">No chapter selections yet.</p>
              )}
              {Object.entries(totals.byChapter).map(([chapter, s]) => (
                <div key={chapter} className="rounded-md border p-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium">{chapter}</span>
                    <span className={s.score >= 0 ? "text-emerald-600" : "text-rose-600"}>{s.score}</span>
                  </div>
                  <div className="mt-1 text-xs text-muted-foreground">
                    {s.correct}C • {s.wrong}W • {s.notAttempted}NA
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
