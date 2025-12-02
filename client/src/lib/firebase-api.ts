import { db } from "./firebase";
import {
    collection,
    getDocs,
    addDoc,
    updateDoc,
    deleteDoc,
    doc,
    query,
    where,
    getDoc,
    writeBatch,
    documentId
} from "firebase/firestore";
import type {
    Question,
    InsertQuestion,
    Exam,
    InsertExam,
    Student,
    InsertStudent,
    User,
    ExamSession,
    InsertExamSession,
    Result,
    InsertResult
} from "@shared/schema";

// Helper to convert Firestore doc to typed object
const docToData = <T>(doc: any): T => ({ id: doc.id, ...doc.data() } as T);

// --- Questions ---
export const getQuestions = async (): Promise<Question[]> => {
    const snapshot = await getDocs(collection(db, "questions"));
    return snapshot.docs.map(d => docToData<Question>(d));
};

export const getQuestion = async (id: string): Promise<Question | null> => {
    const d = await getDoc(doc(db, "questions", id));
    return d.exists() ? docToData<Question>(d) : null;
};

export const getQuestionsByIds = async (ids: string[]): Promise<Question[]> => {
    if (!ids || ids.length === 0) return [];
    // Firestore 'in' query supports up to 10 items.
    // If more, we need multiple queries or just fetch all and filter (for offline/small scale).
    // Given "offline" requirement and likely small dataset, fetching all is safest/easiest.
    // Or we can fetch individually.

    // Optimization: Fetch all questions (cached) and filter.
    const all = await getQuestions();
    return all.filter(q => ids.includes(q.id));
};

export const createQuestion = async (question: InsertQuestion): Promise<Question> => {
    const ref = await addDoc(collection(db, "questions"), question);
    return { id: ref.id, ...question } as Question;
};

export const createQuestionsBulk = async (questions: InsertQuestion[]): Promise<Question[]> => {
    const batch = writeBatch(db);
    const created: Question[] = [];

    questions.forEach(q => {
        const ref = doc(collection(db, "questions"));
        batch.set(ref, q);
        created.push({ id: ref.id, ...q } as Question);
    });

    await batch.commit();
    return created;
};

export const deleteQuestion = async (id: string): Promise<void> => {
    await deleteDoc(doc(db, "questions", id));
};

export const deleteQuestionsBulk = async (ids: string[]): Promise<void> => {
    const batch = writeBatch(db);
    ids.forEach(id => {
        batch.delete(doc(db, "questions", id));
    });
    await batch.commit();
};

// --- Exams ---
export const getExams = async (classLevel?: string): Promise<Exam[]> => {
    let q = query(collection(db, "exams"));
    if (classLevel) {
        q = query(collection(db, "exams"), where("classLevel", "==", classLevel));
    }
    const snapshot = await getDocs(q);
    return snapshot.docs.map(d => docToData<Exam>(d));
};

export const getExam = async (id: string): Promise<Exam | null> => {
    const d = await getDoc(doc(db, "exams", id));
    return d.exists() ? docToData<Exam>(d) : null;
};

export const createExam = async (exam: InsertExam): Promise<Exam> => {
    let finalExam = { ...exam } as any;

    if ((!exam.questionIds || exam.questionIds.length === 0) && exam.numberOfQuestionsToDisplay && exam.numberOfQuestionsToDisplay > 0) {
        const allQuestions = await getQuestions();
        const pool = allQuestions.filter(q => q.classLevel === exam.classLevel && (!exam.subject || q.subject === exam.subject));

        // Shuffle
        for (let i = pool.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [pool[i], pool[j]] = [pool[j], pool[i]];
        }

        finalExam.questionIds = pool.slice(0, exam.numberOfQuestionsToDisplay).map(q => q.id);
    }

    let totalPoints = 0;
    if (finalExam.questionIds && finalExam.questionIds.length > 0) {
        const allQuestions = await getQuestions();
        const questionMap = new Map(allQuestions.map(q => [q.id, q]));

        finalExam.questionIds.forEach((qid: string) => {
            const q = questionMap.get(qid);
            if (q) totalPoints += q.points;
        });
    }

    const examData = {
        ...finalExam,
        totalPoints,
        createdAt: new Date(),
        isActive: true
    };

    const ref = await addDoc(collection(db, "exams"), examData);
    return { id: ref.id, ...examData } as Exam;
};

export const updateExam = async (id: string, updates: Partial<Exam>): Promise<void> => {
    await updateDoc(doc(db, "exams", id), updates);
};

export const deleteExam = async (id: string): Promise<void> => {
    await deleteDoc(doc(db, "exams", id));
};

// --- Students ---
export const getStudents = async (): Promise<Student[]> => {
    const snapshot = await getDocs(collection(db, "students"));
    return snapshot.docs.map(d => docToData<Student>(d));
};

export const createStudent = async (student: InsertStudent): Promise<Student> => {
    const ref = await addDoc(collection(db, "students"), student);
    return { id: ref.id, ...student } as Student;
};

export const createStudentsBulk = async (students: InsertStudent[]): Promise<Student[]> => {
    const batch = writeBatch(db);
    const created: Student[] = [];

    students.forEach(s => {
        const ref = doc(collection(db, "students"));
        batch.set(ref, s);
        created.push({ id: ref.id, ...s } as Student);
    });

    await batch.commit();
    return created;
};

export const updateStudent = async (id: string, updates: Partial<Student>): Promise<void> => {
    await updateDoc(doc(db, "students", id), updates);
};

export const deleteStudent = async (id: string): Promise<void> => {
    await deleteDoc(doc(db, "students", id));
};

export const studentLogin = async (name: string, studentId: string): Promise<Student | null> => {
    const students = await getStudents();
    return students.find(s =>
        s.name.trim().toLowerCase() === name.trim().toLowerCase() &&
        s.studentId.trim().toLowerCase() === studentId.trim().toLowerCase()
    ) || null;
};

// --- Admin ---
export const adminLogin = async (username: string, password: string): Promise<User | null> => {
    const q = query(collection(db, "users"), where("username", "==", username));
    const snapshot = await getDocs(q);
    if (snapshot.empty) return null;

    const user = docToData<User>(snapshot.docs[0]);
    if (user.password !== password) return null;

    return user;
};

// --- Exam Sessions ---
export const getExamSession = async (id: string): Promise<ExamSession | null> => {
    const d = await getDoc(doc(db, "exam_sessions", id));
    return d.exists() ? docToData<ExamSession>(d) : null;
};

export const createExamSession = async (session: InsertExamSession): Promise<ExamSession> => {
    const exam = await getExam(session.examId);
    if (!exam) throw new Error("Exam not found");

    let sessionQuestionIds = [...exam.questionIds];
    // Shuffle
    for (let i = sessionQuestionIds.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [sessionQuestionIds[i], sessionQuestionIds[j]] = [sessionQuestionIds[j], sessionQuestionIds[i]];
    }

    if (exam.numberOfQuestionsToDisplay && exam.numberOfQuestionsToDisplay > 0 && exam.numberOfQuestionsToDisplay < sessionQuestionIds.length) {
        sessionQuestionIds = sessionQuestionIds.slice(0, exam.numberOfQuestionsToDisplay);
    }

    const sessionData = {
        ...session,
        sessionQuestionIds,
        startedAt: new Date(),
        isCompleted: false,
        answers: {},
        currentQuestionIndex: 0
    };

    const ref = await addDoc(collection(db, "exam_sessions"), sessionData);
    return { id: ref.id, ...sessionData } as unknown as ExamSession;
};

export const updateExamSession = async (id: string, updates: Partial<ExamSession>): Promise<void> => {
    await updateDoc(doc(db, "exam_sessions", id), updates);
};

export const submitExamSession = async (sessionId: string, answers: Record<string, string>): Promise<Result> => {
    const session = await getExamSession(sessionId);
    if (!session) throw new Error("Session not found");

    if (session.isCompleted) {
        const q = query(collection(db, "results"), where("sessionId", "==", sessionId));
        const snapshot = await getDocs(q);
        if (!snapshot.empty) return docToData<Result>(snapshot.docs[0]);
    }

    const exam = await getExam(session.examId);
    if (!exam) throw new Error("Exam not found");

    const questionIdsToGrade = session.sessionQuestionIds || exam.questionIds;
    const allQuestions = await getQuestions();
    const questionMap = new Map(allQuestions.map(q => [q.id, q]));

    const correctAnswers: Record<string, boolean> = {};
    let score = 0;
    let sessionTotalPoints = 0;

    for (const qId of questionIdsToGrade) {
        const q = questionMap.get(qId);
        if (q) {
            sessionTotalPoints += q.points;
            const studentAnswer = answers[qId];
            const isCorrect = !!studentAnswer && studentAnswer.trim().toLowerCase() === q.correctAnswer.trim().toLowerCase();
            correctAnswers[qId] = isCorrect;
            if (isCorrect) score += q.points;
        }
    }

    const percentage = sessionTotalPoints > 0 ? Math.round((score / sessionTotalPoints) * 100) : 0;
    const passed = percentage >= exam.passingScore;

    await updateExamSession(sessionId, {
        isCompleted: true,
        endedAt: new Date(),
        answers
    });

    const resultData = {
        sessionId,
        examId: exam.id,
        studentName: session.studentName,
        studentId: session.studentId,
        score,
        totalPoints: sessionTotalPoints,
        percentage,
        passed,
        answers,
        correctAnswers,
        completedAt: new Date()
    };

    const ref = await addDoc(collection(db, "results"), resultData);
    return { id: ref.id, ...resultData } as unknown as Result;
};

// --- Results ---
export const getResults = async (): Promise<Result[]> => {
    const snapshot = await getDocs(collection(db, "results"));
    return snapshot.docs.map(d => docToData<Result>(d));
};

export const getResult = async (id: string): Promise<Result | null> => {
    const d = await getDoc(doc(db, "results", id));
    return d.exists() ? docToData<Result>(d) : null;
};
