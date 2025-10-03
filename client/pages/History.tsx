import Layout from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { loadTests, deleteTest, sendTestEmail } from "@/lib/storage";
import { TestRecord } from "@shared/api";
import { useMemo, useState, useEffect } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Trash2, Mail } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

export default function History() {
  const [subjectFilter, setSubjectFilter] = useState<string>("All");
  const [tests, setTests] = useState<TestRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [sendingEmailId, setSendingEmailId] = useState<string | null>(null);
  const [emailMessage, setEmailMessage] = useState<string | null>(null);
  
  const { user } = useAuth();

  // Load tests from database on component mount
  useEffect(() => {
    async function fetchTests() {
      try {
        setLoading(true);
        const testData = await loadTests();
        setTests(testData);
        setError(null);
      } catch (err) {
        console.error('Failed to load tests:', err);
        setError('Failed to load test history');
      } finally {
        setLoading(false);
      }
    }
    
    fetchTests();
  }, []);

  const filtered = useMemo(() => tests.filter((t) => subjectFilter === "All" || t.subject === subjectFilter), [tests, subjectFilter]);

  const handleDeleteTest = async (testId: string) => {
    try {
      setDeletingId(testId);
      await deleteTest(testId);
      // Refresh the tests list after deletion
      const updatedTests = await loadTests();
      setTests(updatedTests);
    } catch (err) {
      console.error('Failed to delete test:', err);
      setError('Failed to delete test');
    } finally {
      setDeletingId(null);
    }
  };

  const handleSendEmail = async (testId: string) => {
    try {
      setSendingEmailId(testId);
      setEmailMessage(null);
      await sendTestEmail(testId);
      setEmailMessage('Test results sent successfully to guardian email!');
    } catch (err) {
      console.error('Failed to send email:', err);
      setError('Failed to send email. Please check if guardian email is configured.');
    } finally {
      setSendingEmailId(null);
    }
  };

  return (
    <Layout>
      <div className="grid gap-6">
        <Card>
          <CardHeader className="flex-row items-center justify-between space-y-0">
            <CardTitle>Past Tests</CardTitle>
            <div className="w-48">
              <Select value={subjectFilter} onValueChange={setSubjectFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="All">All Subjects</SelectItem>
                  <SelectItem value="Physics">Physics</SelectItem>
                  <SelectItem value="Chemistry">Chemistry</SelectItem>
                  <SelectItem value="Biology">Biology</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <p className="text-sm text-muted-foreground">Loading test history...</p>
            ) : error ? (
              <p className="text-sm text-red-600">{error}</p>
            ) : emailMessage ? (
              <p className="text-sm text-green-600 bg-green-50 p-3 rounded-md">{emailMessage}</p>
            ) : filtered.length === 0 ? (
              <p className="text-sm text-muted-foreground">No tests recorded yet. Create one from the New Test page.</p>
            ) : (
              <div className="space-y-6">
                {filtered.map((t: TestRecord) => (
                  <div key={t.id} className="rounded-lg border">
                    <div className="flex flex-wrap items-center justify-between gap-2 border-b bg-muted/30 px-4 py-3 text-sm">
                      <div className="flex items-center gap-3">
                        <span className="rounded-md bg-primary/10 px-2 py-1 text-primary">{t.subject}</span>
                        <span className="font-medium">{new Date(t.dateISO).toLocaleString()}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="text-muted-foreground">
                          Score <span className={t.score >= 0 ? "text-emerald-600" : "text-rose-600"}>{t.score}</span> • {t.correct}C / {t.wrong}W / {t.notAttempted}NA
                        </div>
                        {user?.guardianEmail && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0 text-muted-foreground hover:text-blue-600"
                            disabled={sendingEmailId === t.id}
                            onClick={() => handleSendEmail(t.id)}
                            title="Send test results via email"
                          >
                            <Mail className="h-4 w-4" />
                          </Button>
                        )}
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0 text-muted-foreground hover:text-red-600"
                              disabled={deletingId === t.id}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete Test Record</AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure you want to delete this test record? This action cannot be undone.
                                <br />
                                <br />
                                <strong>{t.subject}</strong> - {new Date(t.dateISO).toLocaleString()}
                                <br />
                                Score: {t.score} ({t.correct}C / {t.wrong}W / {t.notAttempted}NA)
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => handleDeleteTest(t.id)}
                                className="bg-red-600 hover:bg-red-700"
                              >
                                Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </div>
                    <div className="p-4">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Chapter</TableHead>
                            <TableHead className="w-24">Correct</TableHead>
                            <TableHead className="w-24">Wrong</TableHead>
                            <TableHead className="w-24">NA</TableHead>
                            <TableHead className="w-24">Score</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {Object.entries(t.byChapter).map(([chapter, s]) => (
                            <TableRow key={chapter}>
                              <TableCell className="font-medium">{chapter}</TableCell>
                              <TableCell>{s.correct}</TableCell>
                              <TableCell>{s.wrong}</TableCell>
                              <TableCell>{s.notAttempted}</TableCell>
                              <TableCell className={s.score >= 0 ? "text-emerald-600" : "text-rose-600"}>{s.score}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
