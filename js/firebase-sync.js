/* js/firebase-sync.js */

const CURRENT_TASKS_VERSION = 2;

// Initialize Firebase & Firestore
const firebaseConfig = {
    apiKey: "AIzaSyCL1Mrv3p6eYuhjlnpNOXK9zMCPCvimjDE",
    authDomain: "mocks-f6d12.firebaseapp.com",
    projectId: "mocks-f6d12",
    storageBucket: "mocks-f6d12.firebasestorage.app",
    messagingSenderId: "10867128790",
    appId: "1:10867128790:web:3f873fbff4eb15c7850c77",
    measurementId: "G-JCQB2BXCJQ"
};

firebase.initializeApp(firebaseConfig);
window.db = firebase.firestore();
window.storage = firebase.storage();

// Enable offline persistence
window.db.enablePersistence({ synchronizeTabs: true })
    .catch((err) => {
        if (err.code == 'failed-precondition') {
            console.warn("Firestore persistence failed: multiple tabs open");
        } else if (err.code == 'unimplemented') {
            console.warn("Firestore persistence is not supported by this browser");
        }
    });

// Global state variables
window.currentUser = 'BF'; // default
window.agenda = [];
window.shifts = [];
window.activeSession = null;
window.timetable = {};
window.blueprintCheckboxes = {};
window.mistakes = [];
window.blueprintTasks = [];

window.isUpdatingFromFirestore = false;
window.hasLoadedUserData = false;
window.unsubscribeFirestore = null;

// Default layouts
window.defaultTimetableBF = {
    "Mon": {
        "morning": "Math AA HL\nCurves (Ch 19) & Optimization (Ch 20B-D)\n(Excl. Kinematics)",
        "afternoon": "CS HL P2\nPython & File Processing SL operations\nPractice exception handling",
        "evening": "Spanish B\nCompartir el planeta & Essay structure\nReview vocab lists"
    },
    "Tue": {
        "morning": "Physics HL\nCircuits (B5) & SHM (C1)\nSolve 5 past paper problems",
        "afternoon": "Business SL\nUnit 3 Finance calculations\n(Excl. Budgeting)",
        "evening": "English\nGatsby vs Kite Runner comparative structure outline"
    },
    "Wed": {
        "morning": "Math AA HL\nTransformations (Ch 5) & Complex numbers (Ch 6)\nPolar equations",
        "afternoon": "CS HL Databases: SQL Joins, Normalisation, Views & Subqueries",
        "evening": "Spanish B\nIdentidades & Diario Format practice\nWrite entries"
    },
    "Thu": {
        "morning": "Math AA HL\nTIMED Paper 1 Mock (No Calculator)\nAnalyze weak steps",
        "afternoon": "Physics HL\nTIMED P1 Mock & mark scheme correction\nRelativity theory",
        "evening": "Business SL\nFull P2 Case Study Practice\nUse past paper guidelines"
    },
    "Fri": {
        "morning": "Math AA HL\nSequences & Series (Ch 7)\nBinomial Expansion sums",
        "afternoon": "CS HL P1\nCore structures, Stack/Queue & Recursion dry runs",
        "evening": "English\nFinal quote flashcards Gatsby/Kite Runner"
    },
    "Sat": {
        "morning": "Math AA HL\nTIMED Paper 2 Mock (Calculator)\nSolve solver models",
        "afternoon": "Physics HL\nTIMED P2 Mock & full review\nForces & Thermal cycles",
        "evening": "Spanish B\nExperiencias & write Blog post outline"
    },
    "Sun": {
        "morning": "Math HL\nInduction proof (Ch 9) & Trig (Ch 10-13) identities",
        "afternoon": "Physics HL / CS\nFormula sheet revision & Mistakes log recap\nDatabase query review & OOP subclass trace",
        "evening": "REST\nPack bag for Monday. Sleep by 10:30 PM."
    }
};

window.defaultTimetableMahi = {
    // Mahi doesn't have a weekly timetable tab visible, but we initialize it anyway
    "Mon": { "morning": "", "afternoon": "", "evening": "" },
    "Tue": { "morning": "", "afternoon": "", "evening": "" },
    "Wed": { "morning": "", "afternoon": "", "evening": "" },
    "Thu": { "morning": "", "afternoon": "", "evening": "" },
    "Fri": { "morning": "", "afternoon": "", "evening": "" },
    "Sat": { "morning": "", "afternoon": "", "evening": "" },
    "Sun": { "morning": "", "afternoon": "", "evening": "" }
};

window.defaultBlueprintTasksMahi = [
    // Phase 2: Study Leave
    { id: "gf-leave-sat-1", date: "Saturday, May 23", phase: "Study Leave", subject: "chem", time: "Morning (10AM-1PM)", title: "Particulate Nature & Electron Configurations", desc: "Structure 1.1 (Intro to particulate nature of matter), 1.2 (The nuclear atom), and 1.3 (Electron configurations). Practice orbital writing and configurations.", completed: false, tip: "💡 Check exclusions like the ionization energy drop from Be to B, and Mg to Al!" },
    { id: "gf-leave-sat-2", date: "Saturday, May 23", phase: "Study Leave", subject: "bio", time: "Afternoon (2PM-5PM)", title: "Theme A: Water, Nucleic Acids & Cell Structure", desc: "Focus on Theme A: A1.1 (Water), A1.2 (Nucleic Acids), and A2.2 (Cell Structure). Practice drawing nucleotide connections and comparing prokaryote vs eukaryote cell structures.", completed: false, tip: "💡 Draw water molecules showing partial charges and hydrogen bonding!" },
    { id: "gf-leave-sat-3", date: "Saturday, May 23", phase: "Study Leave", subject: "eng", time: "Evening (6PM-7:30PM)", title: "English Paper 1 Infographics", desc: "Practice analyzing infographic layouts, typography, color palettes, and audience appeals.", completed: false },

    { id: "gf-leave-sun-1", date: "Sunday, May 24", phase: "Study Leave", subject: "econ", time: "Morning (10AM-1PM)", title: "Microeconomics Fundamentals", desc: "Review demand, supply, market equilibrium, and elasticities. Practice diagram accuracy.", completed: false, tip: "💡 Make sure diagrams have fully labeled axes (Price, Quantity)!" },
    { id: "gf-leave-sun-2", date: "Sunday, May 24", phase: "Study Leave", subject: "math", time: "Afternoon (2PM-5PM)", title: "Functions & Transformations", desc: "Quadratic functions, exponential functions, transformations of functions, logs, functions.", completed: false, tip: "💡 Don't forget that log_a(x) is the inverse function of a^x!" },
    { id: "gf-leave-sun-3", date: "Sunday, May 24", phase: "Study Leave", subject: "span", time: "Evening (6PM-7:30PM)", title: "Identidades Vocabulary Drill", desc: "Memorize and write 20 high-value words/phrases for the Identidades (Identities) theme.", completed: false },

    { id: "gf-leave-mon-1", date: "Monday, May 25", phase: "Study Leave", subject: "bio", time: "Morning (10AM-1PM)", title: "Theme B: Carbohydrates, Lipids, Proteins & Membranes", desc: "Focus on Theme B: B1.1 (Carbohydrates and Lipids), B1.2 (Proteins), and B2.1 (Membranes and Membrane Transport). Practice condensation and hydrolysis reaction equations.", completed: false, tip: "💡 Remember the difference between cis- and trans-unsaturated fatty acids!" },
    { id: "gf-leave-mon-2", date: "Monday, May 25", phase: "Study Leave", subject: "chem", time: "Afternoon (2PM-5PM)", title: "Moles, Ideal Gases & The Ionic Model", desc: "Structure 1.4 (Counting particles by mass: The mole), 1.5 (Ideal gases), and Structure 2.1 (The ionic model). Drill mole conversion questions and gas law applications.", completed: false, tip: "💡 Use PV = nRT with correct SI units (P in Pa, V in m³, T in K)!" },
    { id: "gf-leave-mon-3", date: "Monday, May 25", phase: "Study Leave", subject: "econ", time: "Evening (6PM-7:30PM)", title: "Market Failure & Externalities", desc: "Practice negative externalities of production/consumption diagrams and standard evaluation policies.", completed: false },

    { id: "gf-leave-tue-1", date: "Tuesday, May 26", phase: "Study Leave", subject: "math", time: "Morning (10AM-1PM)", title: "Surds, Exponents, Straight Lines & Equations", desc: "Practice simplifying surds, exponent rules, equations of straight lines, and solving linear/simultaneous equations.", completed: false, tip: "💡 Use y - y1 = m(x - x1) for straight line equations!" },
    { id: "gf-leave-tue-2", date: "Tuesday, May 26", phase: "Study Leave", subject: "span", time: "Afternoon (2PM-5PM)", title: "Writing Formats: Blog & Informal Letter", desc: "Review structural layout rules for Blog, Email, and Informal Letter. Write key opening/closing formulas.", completed: false },
    { id: "gf-leave-tue-3", date: "Tuesday, May 26", phase: "Study Leave", subject: "bio", time: "Evening (6PM-7:30PM)", title: "Theme B: Organelles, Specialization & Adaptation", desc: "Focus on Theme B: B2.2 (Organelles and Compartmentalization), B2.3 (Cell Specialization), and B4.1 (Adaptation to Environment).", completed: false, tip: "💡 Review the endosymbiotic theory for chloroplasts and mitochondria!" },

    { id: "gf-leave-wed-1", date: "Wednesday, May 27", phase: "Study Leave", subject: "chem", time: "Morning (10AM-1PM)", title: "Covalent & Metallic Bonding", desc: "Structure 2.2 (The covalent model), 2.3 (The metallic model), and 2.4 (From models to materials). Practice drawing Lewis formulas and predicting VSEPR shapes.", completed: false, tip: "💡 Coordinate covalent bonds involve both electrons coming from the same atom!" },
    { id: "gf-leave-wed-2", date: "Wednesday, May 27", phase: "Study Leave", subject: "econ", time: "Afternoon (2PM-5PM)", title: "Macroeconomics AD/AS", desc: "Review aggregate demand, aggregate supply, Keynesian vs Monetarist models, inflation, and unemployment.", completed: false },
    { id: "gf-leave-wed-3", date: "Wednesday, May 27", phase: "Study Leave", subject: "eng", time: "Evening (6PM-7:30PM)", title: "English Paper 2 Outline: Isolation/Class", desc: "Create 2 comparative outlines for Gatsby and Kite Runner on isolation, class representation, or gender.", completed: false },


    { id: "gf-leave-thu-1", date: "Thursday, May 28", phase: "Study Leave", subject: "math", time: "Morning (10AM-1PM)", title: "Sets, Venn Diagrams & Probability", desc: "Sets and Venn diagrams, right angle measurement (trig), and basic probability.", completed: false, tip: "💡 Probability of A union B: P(A) + P(B) - P(A intersect B)!" },
    { id: "gf-leave-thu-2", date: "Thursday, May 28", phase: "Study Leave", subject: "bio", time: "Afternoon (2PM-5PM)", title: "Theme C: Enzymes, Metabolism, Respiration & Photosynthesis", desc: "Focus on Theme C: C1.1 (Enzymes and Metabolism), C1.2 (Cell Respiration), and C1.3 (Photosynthesis). Practice sketching metabolic pathways and the light reactions.", completed: false, tip: "💡 Make sure to differentiate photophosphorylation from oxidative phosphorylation!" },
    { id: "gf-leave-thu-3", date: "Thursday, May 28", phase: "Study Leave", subject: "span", time: "Evening (6PM-7:30PM)", title: "Reading Comprehension Past Paper", desc: "Do one full Spanish ab initio Paper 1 reading booklet. Mark using the markscheme.", completed: false },

    { id: "gf-leave-fri-1", date: "Friday, May 29", phase: "Study Leave", subject: "chem", time: "Morning (10AM-1PM)", title: "Classification of Matter & Periodic Table", desc: "Structure 3.1 (The periodic table: Classification of elements) and 3.2 (Functional groups: Classification of organic compounds). Review trends across Period 3.", completed: false, tip: "💡 Transition metals have variable oxidation states and form colored complexes!" },
    { id: "gf-leave-fri-2", date: "Friday, May 29", phase: "Study Leave", subject: "econ", time: "Afternoon (2PM-5PM)", title: "Market Structures & Theory of the Firm", desc: "Review perfect competition, monopoly, monopolistic competition, oligopoly, and barriers to entry. Practice profit-max and allocative efficiency diagrams.", completed: false, tip: "💡 Monopoly profit maximization is always where MC = MR!" },
    { id: "gf-leave-fri-3", date: "Friday, May 29", phase: "Study Leave", subject: "eng", time: "Evening (6PM-7:30PM)", title: "English Paper 1 Full Writing Practice", desc: "Timed Paper 1 writing section (1 hour). Focus on getting 4 pages. Analyze layout & design elements.", completed: false },

    { id: "gf-leave-sat30-1", date: "Saturday, May 30", phase: "Study Leave", subject: "math", time: "Morning (10AM-1PM)", title: "Sequences, Series & Binomial Theorem", desc: "Drill arithmetic and geometric sequences/series, sigma notation, and binomial theorem expansions.", completed: false, tip: "💡 The r-th term in a binomial expansion uses nCr!" },
    { id: "gf-leave-sat30-2", date: "Saturday, May 30", phase: "Study Leave", subject: "bio", time: "Afternoon (2PM-5PM)", title: "Theme D: DNA Replication, Protein Synthesis & Inheritance", desc: "Focus on Theme D: D1.1 (DNA Replication), D1.2 (Protein Synthesis), D1.3 (Mutation and Gene Editing), and D3.2 (Inheritance). Drill pedigree charts and codon/anticodon pairings.", completed: false, tip: "💡 mRNA codon is read 5' to 3' by ribosomes!" },
    { id: "gf-leave-sat30-3", date: "Saturday, May 30", phase: "Study Leave", subject: "chem", time: "Evening (6PM-7:30PM)", title: "Functional Groups & Organic Classifications", desc: "Structure 3.2 (Functional groups and classification of organic compounds). Practice naming isomers, recognizing functional groups, and classifying compounds.", completed: false, tip: "💡 Learn to distinguish between primary, secondary, and tertiary alcohols and halogenoalkanes!" },

    { id: "gf-leave-sun31-1", date: "Sunday, May 31", phase: "Study Leave", subject: "econ", time: "Morning (10AM-1PM)", title: "Fiscal, Monetary & Supply-Side Policies", desc: "Active recall on macroeconomic policies. Review strengths/weaknesses and comparative evaluations.", completed: false },
    { id: "gf-leave-sun31-2", date: "Sunday, May 31", phase: "Study Leave", subject: "bio", time: "Afternoon (2PM-5PM)", title: "Theme B & D: Ecological Niches, Stability & Climate Change", desc: "Focus on Theme B: B4.2 (Ecological Niches) and Theme D: D4.2 (Stability and Change), D4.3 (Climate Change). Revisit ecosystems and carbon cycling feedback loops.", completed: false, tip: "💡 Understand how positive feedback loops accelerate climate instability!" },
    { id: "gf-leave-sun31-3", date: "Sunday, May 31", phase: "Study Leave", subject: "span", time: "Evening (6PM-7:30PM)", title: "Spanish Oral Prep & Speaking Cards", desc: "Go over speaking card themes (e.g. Compartir el planeta). Record yourself speaking.", completed: false },

    // Phase 2: Exam Lead-up
    { id: "gf-lead-mon-1", date: "Monday, June 1", phase: "Study Leave", subject: "bio", time: "Morning (10AM-1PM)", title: "Theme C & D: Populations, Energy & Water Potential", desc: "Focus on Theme C: C4.1 (Population and Communities), C4.2 (Transfers of energy and Matter), and Theme D: D2.3 (Water Potential). Review water potential equations.", completed: false, tip: "💡 Water potential (Ψ) = solute potential (Ψs) + pressure potential (Ψp). Solutes always lower water potential!" },
    { id: "gf-lead-mon-2", date: "Monday, June 1", phase: "Study Leave", subject: "chem", time: "Afternoon (2PM-5PM)", title: "Chemistry HL Paper 2 Mock Exam", desc: "Solve a full past Paper 2 Chemistry HL under timed conditions. Focus on Structures 1, 2, and 3.", completed: false },
    { id: "gf-lead-mon-3", date: "Monday, June 1", phase: "Study Leave", subject: "span", time: "Evening (6PM-7:30PM)", title: "Spanish Blog & Diary Practice", desc: "Draft two practice texts in Spanish (a blog post on environment and a diary entry on experiences).", completed: false },

    { id: "gf-lead-tue-1", date: "Tuesday, June 2", phase: "Study Leave", subject: "econ", time: "Morning (10AM-1PM)", title: "Econ Diagram Sprint", desc: "Draw 15 micro/macro diagrams from memory (externalities, tariffs, monetary policy, business cycles).", completed: false },
    { id: "gf-lead-tue-2", date: "Tuesday, June 2", phase: "Study Leave", subject: "math", time: "Afternoon (2PM-5PM)", title: "Measurement, Sampling & Statistics", desc: "Measurement calculations, sampling and data collection methods, statistics - average and speed.", completed: false, tip: "💡 Remember speed = distance / time. For average speed, use total distance / total time!" },
    { id: "gf-lead-tue-3", date: "Tuesday, June 2", phase: "Study Leave", subject: "eng", time: "Evening (6PM-7:30PM)", title: "English Paper 2 Quotes Drill", desc: "Review 10 quotes for Gatsby and 10 quotes for Kite Runner. Test thesis drafting for random prompts.", completed: false },

    { id: "gf-lead-wed-1", date: "Wednesday, June 3", phase: "Study Leave", subject: "chem", time: "Morning (10AM-1PM)", title: "Chemistry HL Structures 1-3 Review", desc: "Drill questions on mole calculations, electron configurations, and organic functional groups.", completed: false },
    { id: "gf-lead-wed-2", date: "Wednesday, June 3", phase: "Study Leave", subject: "bio", time: "Afternoon (2PM-5PM)", title: "Biology HL Paper 2 Timed Practice", desc: "Solve a full past Paper 2 Biology HL covering Themes A, B, C, and D. Grade using the latest markscheme standards.", completed: false },
    { id: "gf-lead-wed-3", date: "Wednesday, June 3", phase: "Study Leave", subject: "econ", time: "Evening (6PM-7:30PM)", title: "Econ Paper 3 Calculations Prep", desc: "Practice elasticity values, inflation index calculations, marginal tax rates, and linear functions.", completed: false },

    { id: "gf-lead-thu-1", date: "Thursday, June 4", phase: "Study Leave", subject: "span", time: "Morning (10AM-1PM)", title: "Spanish Writing Layout Check", desc: "Quick revision of layout formats: Folleto, Correo, Diario, Blog, Artículo. Review key verbs.", completed: false },
    { id: "gf-lead-thu-2", date: "Thursday, June 4", phase: "Study Leave", subject: "bio", time: "Afternoon (2PM-5PM)", title: "Bio/Chem Mistakes Summary", desc: "Do a final read through your mistakes log topics. Ensure all new syllabus concepts (Themes A-D & Structures 1-3) are clear.", completed: false },
    { id: "gf-lead-thu-3", date: "Thursday, June 4", phase: "Study Leave", subject: "span", time: "Evening (6PM-7:30PM)", title: "REST & Sleep Early", desc: "Prepare exam stationery (black pens, calculator, water). Sleep early for Spanish P1 tomorrow!", completed: false },

    // Phase 3: Mock Exams
    { id: "gf-exam-fri-1", date: "Friday, June 5", phase: "Mock Exams", subject: "exam", time: "7:50 AM", title: "📝 SPANISH AB INITIO P1 EXAM", desc: "Reading comprehension & vocabulary paper.", completed: false },
    { id: "gf-exam-fri-2", date: "Friday, June 5", phase: "Mock Exams", subject: "span", time: "Afternoon", title: "Spanish P2 & English P1 Prep", desc: "Review Spanish writing structures and English infographic analysis tips.", completed: false },

    { id: "gf-exam-mon-1", date: "Monday, June 8", phase: "Mock Exams", subject: "exam", time: "7:50 AM", title: "📝 SPANISH AB INITIO P2 EXAM", desc: "Writing paper.", completed: false },
    { id: "gf-exam-mon-2", date: "Monday, June 8", phase: "Mock Exams", subject: "exam", time: "10:00 AM", title: "📝 ENGLISH SL P1 EXAM", desc: "Infographics / textual analysis paper.", completed: false },
    { id: "gf-exam-mon-3", date: "Monday, June 8", phase: "Mock Exams", subject: "exam", time: "12:50 PM", title: "📝 CHEMISTRY HL P1 EXAM", desc: "Multiple choice paper.", completed: false },
    { id: "gf-exam-mon-4", date: "Monday, June 8", phase: "Mock Exams", subject: "chem", time: "Evening", title: "Chemistry HL Paper 2 Review", desc: "Final review of Structures 1-3 (particulate nature, bonding, and classification of matter).", completed: false },

    { id: "gf-exam-tue-1", date: "Tuesday, June 9", phase: "Mock Exams", subject: "exam", time: "7:50 AM", title: "📝 ENGLISH SL P2 EXAM", desc: "Gatsby vs Kite Runner comparison essay paper.", completed: false },
    { id: "gf-exam-tue-2", date: "Tuesday, June 9", phase: "Mock Exams", subject: "exam", time: "10:00 AM", title: "📝 CHEMISTRY HL P2 EXAM", desc: "Extended response chemistry paper.", completed: false },
    { id: "gf-exam-tue-3", date: "Tuesday, June 9", phase: "Mock Exams", subject: "bio", time: "Afternoon", title: "Biology HL Paper 1 & 2 Revision", desc: "Review Themes A-D: respiration, water potential, cell structure, and inheritance.", completed: false },

    { id: "gf-exam-wed-1", date: "Wednesday, June 10", phase: "Mock Exams", subject: "exam", time: "7:50 AM", title: "📝 BIOLOGY HL P1 EXAM", desc: "Multiple choice biology paper.", completed: false },
    { id: "gf-exam-wed-2", date: "Wednesday, June 10", phase: "Mock Exams", subject: "exam", time: "10:20 AM", title: "📝 BIOLOGY HL P2 EXAM", desc: "Extended response biology paper.", completed: false },
    { id: "gf-exam-wed-3", date: "Wednesday, June 10", phase: "Mock Exams", subject: "exam", time: "1:30 PM", title: "📝 ECONOMICS HL P1 EXAM", desc: "Micro/Macro essay choices.", completed: false },
    { id: "gf-exam-wed-4", date: "Wednesday, June 10", phase: "Mock Exams", subject: "econ", time: "Evening", title: "Economics HL P2 & Math P1 Prep", desc: "Review micro/macro economics, market structures, and Math Paper 1 topics (functions, quadratic equations, logs).", completed: false },

    { id: "gf-exam-thu-1", date: "Thursday, June 11", phase: "Mock Exams", subject: "exam", time: "7:50 AM", title: "📝 MATHS AASL P1 EXAM", desc: "Non-calculator mathematics paper.", completed: false },
    { id: "gf-exam-thu-2", date: "Thursday, June 11", phase: "Mock Exams", subject: "exam", time: "10:20 AM", title: "📝 ECONOMICS HL P2 EXAM", desc: "Data response economics paper.", completed: false },
    { id: "gf-exam-thu-3", date: "Thursday, June 11", phase: "Mock Exams", subject: "math", time: "Afternoon", title: "Maths AA SL P2 Prep", desc: "Graphing calculator active practice on statistics (average and speed), probability distributions, exponential functions, and Venn diagrams.", completed: false },

    { id: "gf-exam-fri12-1", date: "Friday, June 12", phase: "Mock Exams", subject: "exam", time: "7:50 AM", title: "📝 MATHS AASL P2 EXAM", desc: "Calculator active mathematics paper.", completed: false },
    { id: "gf-exam-fri12-2", date: "Friday, June 12", phase: "Mock Exams", subject: "exam", time: "Afternoon", title: "🎉 MOCKS ARE OVER!", desc: "Time to relax and celebrate!", completed: false }
];

// Sync updates to Firestore
window.pushStateToFirestore = function() {
    if (window.isUpdatingFromFirestore) return;
    if (!window.hasLoadedUserData) {
        console.warn("Skipping pushStateToFirestore because user data has not finished loading yet.");
        return;
    }
    
    const docId = (window.currentUser === 'GF') ? 'gf_dashboard' : 'dashboard';
    window.db.collection('study_data').doc(docId).set({
        agenda: window.agenda,
        shifts: window.shifts,
        activeSession: window.activeSession,
        timetable: window.timetable,
        blueprintCheckboxes: window.blueprintCheckboxes,
        mistakes: window.mistakes,
        blueprintTasks: window.blueprintTasks,
        pinnedStickers: window.pinnedStickers || [],
        grindStreak: window.grindStreak || 0,
        lastStudyDate: window.lastStudyDate || '',
        liveReaction: window.liveReaction || null,
        tasksVersion: CURRENT_TASKS_VERSION,
        lastActive: Date.now()
    }, { merge: true }).catch(err => {
        console.error("Firestore write failed (offline sync buffered):", err);
    });
};

// Update user activity timestamp in Firestore (throttled to limit writes)
window.updateUserActivity = function() {
    if (window.isUpdatingFromFirestore) return;
    const docId = (window.currentUser === 'GF') ? 'gf_dashboard' : 'dashboard';
    window.db.collection('study_data').doc(docId).update({
        lastActive: Date.now()
    }).catch(err => {
        // Fallback: if document doesn't exist, we can use set with merge
        window.db.collection('study_data').doc(docId).set({
            lastActive: Date.now()
        }, { merge: true }).catch(e => {
            console.warn("Failed to set user activity:", e);
        });
    });
};

// Migration helper to auto-align Mahi's blueprint tasks to the new syllabus
window.migrateMahiBlueprintTasks = function(tasks) {
    if (!Array.isArray(tasks)) return { tasks: [], modified: false };
    
    // Create a map of the new default tasks by id
    const defaultTasksMap = {};
    window.defaultBlueprintTasksMahi.forEach(t => {
        defaultTasksMap[t.id] = t;
    });

    let modified = false;
    
    // 1. Update existing standard default tasks with the new titles, descriptions, etc.
    const updatedTasks = tasks.map(task => {
        if (task && task.id && defaultTasksMap[task.id]) {
            const defaultTask = defaultTasksMap[task.id];
            
            // Check if standard properties (except completed status) have changed
            const hasChanged = 
                task.title !== defaultTask.title ||
                task.desc !== defaultTask.desc ||
                task.tip !== defaultTask.tip ||
                task.subject !== defaultTask.subject ||
                task.date !== defaultTask.date ||
                task.time !== defaultTask.time ||
                task.phase !== defaultTask.phase;
                
            if (hasChanged) {
                modified = true;
                return {
                    ...defaultTask,
                    completed: task.completed // Preserve completed status
                };
            }
        }
        return task;
    });

    // 2. Insert any new standard default tasks that are completely missing from the user's checklist
    const existingIds = new Set(updatedTasks.filter(t => t && t.id).map(t => t.id));
    window.defaultBlueprintTasksMahi.forEach(defaultTask => {
        if (!existingIds.has(defaultTask.id)) {
            updatedTasks.push({ ...defaultTask });
            modified = true;
        }
    });

    // 3. Sort tasks: standard default tasks first in chronological order (matching defaultBlueprintTasksMahi),
    // and custom user tasks appended at the end.
    const defaultOrder = window.defaultBlueprintTasksMahi.map(t => t.id);
    updatedTasks.sort((a, b) => {
        const indexA = defaultOrder.indexOf(a.id);
        const indexB = defaultOrder.indexOf(b.id);
        
        if (indexA !== -1 && indexB !== -1) {
            return indexA - indexB;
        }
        if (indexA !== -1) return -1;
        if (indexB !== -1) return 1;
        
        // Preserve relative order of custom tasks
        return 0;
    });

    return { tasks: updatedTasks, modified };
};

// Listen and sync with DB for current user
window.loadUserData = function(user) {
    window.currentUser = user;
    window.hasLoadedUserData = false;
    const docId = (user === 'GF') ? 'gf_dashboard' : 'dashboard';
    const storagePrefix = user + '_';
    const defaultTimetable = (user === 'GF') ? window.defaultTimetableMahi : window.defaultTimetableBF;

    // Unsubscribe from previous listener if exists
    if (window.unsubscribeFirestore) {
        window.unsubscribeFirestore();
        window.unsubscribeFirestore = null;
    }

    // Load initial backup from localStorage
    const localAgenda = JSON.parse(localStorage.getItem(storagePrefix + 'agenda')) || [];
    const localShifts = JSON.parse(localStorage.getItem(storagePrefix + 'shifts')) || [];
    const localActiveSession = JSON.parse(localStorage.getItem(storagePrefix + 'active_session')) || null;
    const localTimetable = JSON.parse(localStorage.getItem(storagePrefix + 'timetable')) || defaultTimetable;
    const localMistakes = JSON.parse(localStorage.getItem(storagePrefix + 'mistakes')) || [];
    const localPinnedStickers = JSON.parse(localStorage.getItem(storagePrefix + 'pinned_stickers')) || [];
    const localGrindStreak = parseInt(localStorage.getItem(storagePrefix + 'grind_streak')) || 0;
    const localLastStudyDate = localStorage.getItem(storagePrefix + 'last_study_date') || '';
    const localLiveReaction = JSON.parse(localStorage.getItem(storagePrefix + 'live_reaction')) || null;
    
    let localBlueprintTasks = JSON.parse(localStorage.getItem(storagePrefix + 'blueprint_tasks')) || (user === 'GF' ? window.defaultBlueprintTasksMahi : []);
    if (user === 'GF') {
        const migration = window.migrateMahiBlueprintTasks(localBlueprintTasks);
        localBlueprintTasks = migration.tasks;
        if (migration.modified) {
            localStorage.setItem(storagePrefix + 'blueprint_tasks', JSON.stringify(localBlueprintTasks));
        }
    }
    
    const localBlueprintCheckboxes = {};
    const blueprintCheckboxesSelector = document.querySelectorAll('.task-checkbox');
    blueprintCheckboxesSelector.forEach(checkbox => {
        const taskId = checkbox.getAttribute('data-task-id');
        if (taskId) {
            localBlueprintCheckboxes[taskId] = localStorage.getItem(storagePrefix + taskId) === 'true';
        }
    });

    // Fallback immediately to local storage variables to minimize loading delays
    window.agenda = localAgenda;
    window.shifts = localShifts;
    window.activeSession = localActiveSession;
    window.timetable = localTimetable;
    window.blueprintCheckboxes = localBlueprintCheckboxes;
    window.mistakes = localMistakes;
    window.blueprintTasks = localBlueprintTasks;
    window.pinnedStickers = localPinnedStickers;
    window.grindStreak = localGrindStreak;
    window.lastStudyDate = localLastStudyDate;
    window.liveReaction = localLiveReaction;

    if (typeof window.updateUserActivity === 'function') {
        window.updateUserActivity();
    }

    if (typeof window.triggerUIUpdates === 'function') {
        window.triggerUIUpdates();
    }

    // Start Real-Time Firestore Sync Listener
    window.unsubscribeFirestore = window.db.collection('study_data').doc(docId).onSnapshot((doc) => {
        if (!doc.exists) {
            console.log("No remote database document found for: " + docId + ". Uploading local cache as backup...");
            window.hasLoadedUserData = true;
            window.pushStateToFirestore();
        } else {
            console.log("Remote database update received for profile: " + user);
            const data = doc.data();
            
            window.isUpdatingFromFirestore = true;
            
            window.agenda = data.agenda || [];
            window.shifts = data.shifts || [];
            window.activeSession = data.activeSession || null;
            window.timetable = data.timetable || defaultTimetable;
            window.mistakes = data.mistakes || [];
            window.blueprintCheckboxes = data.blueprintCheckboxes || {};
            window.pinnedStickers = data.pinnedStickers || [];
            window.grindStreak = data.grindStreak || 0;
            window.lastStudyDate = data.lastStudyDate || '';
            window.liveReaction = data.liveReaction || null;
            
            const remoteVersion = data.tasksVersion || 0;
            let remoteBlueprintTasks = data.blueprintTasks || (user === 'GF' ? window.defaultBlueprintTasksMahi : []);
            let remoteModified = false;
            if (user === 'GF') {
                if (remoteVersion > CURRENT_TASKS_VERSION) {
                    console.log("Remote tasks version (" + remoteVersion + ") is newer than client version (" + CURRENT_TASKS_VERSION + "). Skipping migration to prevent loop.");
                } else {
                    const migration = window.migrateMahiBlueprintTasks(remoteBlueprintTasks);
                    remoteBlueprintTasks = migration.tasks;
                    remoteModified = migration.modified;
                }
            }
            window.blueprintTasks = remoteBlueprintTasks;
            
            // Save state to localStorage with prefix
            localStorage.setItem(storagePrefix + 'agenda', JSON.stringify(window.agenda));
            localStorage.setItem(storagePrefix + 'shifts', JSON.stringify(window.shifts));
            if (window.activeSession) {
                localStorage.setItem(storagePrefix + 'active_session', JSON.stringify(window.activeSession));
            } else {
                localStorage.removeItem(storagePrefix + 'active_session');
            }
            localStorage.setItem(storagePrefix + 'timetable', JSON.stringify(window.timetable));
            localStorage.setItem(storagePrefix + 'mistakes', JSON.stringify(window.mistakes));
            localStorage.setItem(storagePrefix + 'blueprint_tasks', JSON.stringify(window.blueprintTasks));
            localStorage.setItem(storagePrefix + 'pinned_stickers', JSON.stringify(window.pinnedStickers));
            localStorage.setItem(storagePrefix + 'grind_streak', window.grindStreak);
            localStorage.setItem(storagePrefix + 'last_study_date', window.lastStudyDate);
            if (window.liveReaction) {
                localStorage.setItem(storagePrefix + 'live_reaction', JSON.stringify(window.liveReaction));
            } else {
                localStorage.removeItem(storagePrefix + 'live_reaction');
            }
            
            Object.keys(window.blueprintCheckboxes).forEach(taskId => {
                localStorage.setItem(storagePrefix + taskId, window.blueprintCheckboxes[taskId]);
            });
            
            // Trigger UI rendering
            if (typeof window.triggerUIUpdates === 'function') {
                window.triggerUIUpdates();
            }
            
            window.isUpdatingFromFirestore = false;
            window.hasLoadedUserData = true;
            
            // If remote data had to be migrated, push the updated state back to Firestore
            if (remoteModified) {
                console.log("Pushing migrated blueprint tasks to Firestore...");
                window.db.collection('study_data').doc(docId).update({
                    blueprintTasks: window.blueprintTasks,
                    tasksVersion: CURRENT_TASKS_VERSION
                }).catch(err => {
                    console.error("Firestore update failed for migrated tasks:", err);
                });
            }
        }
    }, (error) => {
        console.error("Firestore loading error. Operating in offline localStorage fallback mode.", error);
        // Ensure UI stays updated with the local fallback data loaded initially
        if (typeof window.triggerUIUpdates === 'function') {
            window.triggerUIUpdates();
        }
    });
};

// Global state for head-to-head competition
window.competitionStats = {
    'BF': { today: 0, total: 0, active: false, subject: '', pinnedStickers: [], grindStreak: 0, lastStudyDate: '', liveReaction: null, lastActive: 0 },
    'GF': { today: 0, total: 0, active: false, subject: '', pinnedStickers: [], grindStreak: 0, lastStudyDate: '', liveReaction: null, lastActive: 0 }
};

if (!window.lastProcessedReactions) {
    window.lastProcessedReactions = { 'BF': 0, 'GF': 0 };
}

// Start background listener for the entire collection to sync competition scores and live statuses
window.db.collection('study_data').onSnapshot((querySnapshot) => {
    const todayStr = new Date().toDateString();
    
    querySnapshot.forEach((doc) => {
        if (doc.id !== 'dashboard' && doc.id !== 'gf_dashboard') return;
        
        const data = doc.data();
        const userKey = (doc.id === 'gf_dashboard') ? 'GF' : 'BF';
        
        let totalMins = 0;
        let todayMins = 0;
        
        if (data.shifts) {
            data.shifts.forEach(s => {
                totalMins += s.duration;
                if (new Date(s.date).toDateString() === todayStr) {
                    todayMins += s.duration;
                }
            });
        }
        
        window.competitionStats[userKey] = {
            today: todayMins / 60,
            total: totalMins / 60,
            active: !!data.activeSession,
            subject: data.activeSession ? data.activeSession.subject : '',
            pinnedStickers: data.pinnedStickers || [],
            grindStreak: data.grindStreak || 0,
            lastStudyDate: data.lastStudyDate || '',
            liveReaction: data.liveReaction || null,
            lastActive: data.lastActive || 0
        };

        // Real-Time Reaction Visual Trigger
        if (userKey !== window.currentUser && data.liveReaction) {
            const lastTime = window.lastProcessedReactions[userKey] || 0;
            if (data.liveReaction.timestamp > lastTime) {
                window.lastProcessedReactions[userKey] = data.liveReaction.timestamp;
                
                // Only float if it occurred very recently (prevent trigger on initial load or ancient updates)
                if (Date.now() - data.liveReaction.timestamp < 10000) {
                    if (typeof window.triggerFloatingReaction === 'function') {
                        window.triggerFloatingReaction(data.liveReaction.emoji);
                    }
                }
            }
        }
    });
    
    // Trigger comparison widget redraw
    if (typeof window.renderCompetitionWidget === 'function') {
        window.renderCompetitionWidget();
    }
}, (error) => {
    console.error("Collection snapshot error for comparison:", error);
});

// Periodic activity heartbeat (every 2 minutes, only if tab is visible)
setInterval(() => {
    if (document.visibilityState === 'visible' && typeof window.updateUserActivity === 'function') {
        window.updateUserActivity();
    }
}, 2 * 60 * 1000);

// Instantly update activity when tab becomes visible
document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible' && typeof window.updateUserActivity === 'function') {
        window.updateUserActivity();
    }
});
