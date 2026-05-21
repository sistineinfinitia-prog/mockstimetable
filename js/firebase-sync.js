/* js/firebase-sync.js */

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
        "afternoon": "CS HL P1\nDatabases SL/HL Normalisation & SQL aggregators",
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
        "afternoon": "Physics HL / CS\nFormula sheet revision & Mistakes log recap\nOOP subclass trace",
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
    { id: "gf-leave-sat-1", date: "Saturday, May 23", phase: "Study Leave", subject: "chem", time: "Morning (10AM-1PM)", title: "Stoichiometry & Atomic Structure", desc: "Topic 1 (mole calculations, limiting reactant) & Topic 2 (atomic electron configurations, periodic trends).", completed: false, tip: "💡 Check periodic trend exclusions (e.g. IE drop from Be to B)!" },
    { id: "gf-leave-sat-2", date: "Saturday, May 23", phase: "Study Leave", subject: "bio", time: "Afternoon (2PM-5PM)", title: "Cell Biology & Molecular Biology", desc: "Topic 1 (cell theory, cell division) & Topic 2 (DNA replication, transcription, translation). Active recall questions.", completed: false },
    { id: "gf-leave-sat-3", date: "Saturday, May 23", phase: "Study Leave", subject: "eng", time: "Evening (6PM-7:30PM)", title: "English Paper 1 Infographics", desc: "Practice analyzing infographic layouts, typography, color palettes, and audience appeals.", completed: false },

    { id: "gf-leave-sun-1", date: "Sunday, May 24", phase: "Study Leave", subject: "econ", time: "Morning (10AM-1PM)", title: "Microeconomics Fundamentals", desc: "Review demand, supply, market equilibrium, and elasticities. Practice diagram accuracy.", completed: false, tip: "💡 Make sure diagrams have fully labeled axes (Price, Quantity)!" },
    { id: "gf-leave-sun-2", date: "Sunday, May 24", phase: "Study Leave", subject: "math", time: "Afternoon (2PM-5PM)", title: "Functions & Quad Transformations", desc: "Quadratics, solving equations, transformations of graphs, logs and exponent functions.", completed: false },
    { id: "gf-leave-sun-3", date: "Sunday, May 24", phase: "Study Leave", subject: "span", time: "Evening (6PM-7:30PM)", title: "Identidades Vocabulary Drill", desc: "Memorize and write 20 high-value words/phrases for the Identidades (Identities) theme.", completed: false },

    { id: "gf-leave-mon-1", date: "Monday, May 25", phase: "Study Leave", subject: "bio", time: "Morning (10AM-1PM)", title: "Genetics & Pedigree Analysis", desc: "Topic 3 (genes, chromosomes, meiosis, inheritance). Work through complex genetic crosses & pedigree charts.", completed: false },
    { id: "gf-leave-mon-2", date: "Monday, May 25", phase: "Study Leave", subject: "chem", time: "Afternoon (2PM-5PM)", title: "Chemical Bonding & Shapes", desc: "Topic 4 (ionic, covalent, metallic bonding, intermolecular forces, Lewis structures, VSEPR theory molecular geometries).", completed: false },
    { id: "gf-leave-mon-3", date: "Monday, May 25", phase: "Study Leave", subject: "econ", time: "Evening (6PM-7:30PM)", title: "Market Failure & Externalities", desc: "Practice negative externalities of production/consumption diagrams and standard evaluation policies.", completed: false },

    { id: "gf-leave-tue-1", date: "Tuesday, May 26", phase: "Study Leave", subject: "math", time: "Morning (10AM-1PM)", title: "Calculus: Differentiation Rules", desc: "Practice product rule, quotient rule, chain rule, and finding tangent/normal equations.", completed: false },
    { id: "gf-leave-tue-2", date: "Tuesday, May 26", phase: "Study Leave", subject: "span", time: "Afternoon (2PM-5PM)", title: "Writing Formats: Blog & Informal Letter", desc: "Review structural layout rules for Blog, Email, and Informal Letter. Write key opening/closing formulas.", completed: false },
    { id: "gf-leave-tue-3", date: "Tuesday, May 26", phase: "Study Leave", subject: "bio", time: "Evening (6PM-7:30PM)", title: "Human Physiology: Digestion & Circulation", desc: "Topic 6 (digestion, heart, blood vessels). Draw heart diagram and explain the cardiac cycle.", completed: false },

    { id: "gf-leave-wed-1", date: "Wednesday, May 27", phase: "Study Leave", subject: "chem", time: "Morning (10AM-1PM)", title: "Kinetics & Equilibrium", desc: "Topic 6 (collision theory, rates of reaction factors) & Topic 7 (Le Chatelier's principle, Kc calculation).", completed: false },
    { id: "gf-leave-wed-2", date: "Wednesday, May 27", phase: "Study Leave", subject: "econ", time: "Afternoon (2PM-5PM)", title: "Macroeconomics AD/AS", desc: "Review aggregate demand, aggregate supply, Keynesian vs Monetarist models, inflation, and unemployment.", completed: false },
    { id: "gf-leave-wed-3", date: "Wednesday, May 27", phase: "Study Leave", subject: "eng", time: "Evening (6PM-7:30PM)", title: "English Paper 2 Outline: Isolation/Class", desc: "Create 2 comparative outlines for Gatsby and Kite Runner on isolation, class representation, or gender.", completed: false },

    { id: "gf-leave-thu-1", date: "Thursday, May 28", phase: "Study Leave", subject: "math", time: "Morning (10AM-1PM)", title: "Probability & Statistics", desc: "Venn diagrams, tree diagrams, normal distribution SL calculations on the calculator.", completed: false, tip: "💡 Practice using normalCDF on your graphic calculator!" },
    { id: "gf-leave-thu-2", date: "Thursday, May 28", phase: "Study Leave", subject: "bio", time: "Afternoon (2PM-5PM)", title: "Cellular Respiration & Photosynthesis", desc: "Topic 7 (nucleic acids) & Topic 8 (cellular respiration and light-dependent/independent photosynthesis stages).", completed: false },
    { id: "gf-leave-thu-3", date: "Thursday, May 28", phase: "Study Leave", subject: "span", time: "Evening (6PM-7:30PM)", title: "Reading Comprehension Past Paper", desc: "Do one full Spanish ab initio Paper 1 reading booklet. Mark using the markscheme.", completed: false },

    { id: "gf-leave-fri-1", date: "Friday, May 29", phase: "Study Leave", subject: "chem", time: "Morning (10AM-1PM)", title: "Acids, Bases & Redox Balancing", desc: "Topic 8 (acids/bases pH, strong vs weak) & Topic 9 (oxidation states, half-equations balancing).", completed: false },
    { id: "gf-leave-fri-2", date: "Friday, May 29", phase: "Study Leave", subject: "econ", time: "Afternoon (2PM-5PM)", title: "Global Economy Exchange Rates", desc: "Review exchange rate determinants, balance of payments, protectionism tariffs and quotas diagrams.", completed: false },
    { id: "gf-leave-fri-3", date: "Friday, May 29", phase: "Study Leave", subject: "eng", time: "Evening (6PM-7:30PM)", title: "English Paper 1 Full Writing Practice", desc: "Timed Paper 1 writing section (1 hour). Focus on getting 4 pages. Analyze layout & design elements.", completed: false },

    { id: "gf-leave-sat30-1", date: "Saturday, May 30", phase: "Study Leave", subject: "math", time: "Morning (10AM-1PM)", title: "Integration & Calculus Apps", desc: "Integration rules, area under curves, definite integrals, and kinematics SL application sums.", completed: false },
    { id: "gf-leave-sat30-2", date: "Saturday, May 30", phase: "Study Leave", subject: "bio", time: "Afternoon (2PM-5PM)", title: "Plant Biology & Animal Physiology", desc: "Topic 9 (xylem/phloem, transpiration) & Topic 11 (muscle contraction steps, kidney nephron excretion).", completed: false },
    { id: "gf-leave-sat30-3", date: "Saturday, May 30", phase: "Study Leave", subject: "chem", time: "Evening (6PM-7:30PM)", title: "Organic Chemistry Pathways", desc: "Topic 10 (alkane/alkene substitution/addition pathways, nucleophilic substitution, functional groups identification).", completed: false },

    { id: "gf-leave-sun31-1", date: "Sunday, May 31", phase: "Study Leave", subject: "econ", time: "Morning (10AM-1PM)", title: "Fiscal, Monetary & Supply-Side Policies", desc: "Active recall on macroeconomic policies. Review strengths/weaknesses and comparative evaluations.", completed: false },
    { id: "gf-leave-sun31-2", date: "Sunday, May 31", phase: "Study Leave", subject: "bio", time: "Afternoon (2PM-5PM)", title: "Topic Summary Checkups", desc: "Go through Mistakes Log and verify conceptual understanding of tricky Biology sections.", completed: false },
    { id: "gf-leave-sun31-3", date: "Sunday, May 31", phase: "Study Leave", subject: "span", time: "Evening (6PM-7:30PM)", title: "Spanish Oral Prep & Speaking Cards", desc: "Go over speaking card themes (e.g. Compartir el planeta). Record yourself speaking.", completed: false },

    // Phase 2: Exam Lead-up
    { id: "gf-lead-mon-1", date: "Monday, June 1", phase: "Study Leave", subject: "bio", time: "Morning (10AM-1PM)", title: "Human Physiology Detailed Review", desc: "Focus on blood clotting, nerve impulses, synapses, and hormone regulations.", completed: false },
    { id: "gf-lead-mon-2", date: "Monday, June 1", phase: "Study Leave", subject: "chem", time: "Afternoon (2PM-5PM)", title: "Chemistry HL Paper 2 Mock Exam", desc: "Solve a full past Paper 2 Chemistry HL under timed conditions. Strictly self-mark.", completed: false },
    { id: "gf-lead-mon-3", date: "Monday, June 1", phase: "Study Leave", subject: "span", time: "Evening (6PM-7:30PM)", title: "Spanish Blog & Diary Practice", desc: "Draft two practice texts in Spanish (a blog post on environment and a diary entry on experiences).", completed: false },

    { id: "gf-lead-tue-1", date: "Tuesday, June 2", phase: "Study Leave", subject: "econ", time: "Morning (10AM-1PM)", title: "Econ Diagram Sprint", desc: "Draw 15 micro/macro diagrams from memory (externalities, tariffs, monetary policy, business cycles).", completed: false },
    { id: "gf-lead-tue-2", date: "Tuesday, June 2", phase: "Study Leave", subject: "math", time: "Afternoon (2PM-5PM)", title: "Math SL Paper 1 Timed Practice", desc: "Do a full Math AA SL Paper 1 (non-calculator) under strict time bounds. Review error marks.", completed: false },
    { id: "gf-lead-tue-3", date: "Tuesday, June 2", phase: "Study Leave", subject: "eng", time: "Evening (6PM-7:30PM)", title: "English Paper 2 Quotes Drill", desc: "Review 10 quotes for Gatsby and 10 quotes for Kite Runner. Test thesis drafting for random prompts.", completed: false },

    { id: "gf-lead-wed-1", date: "Wednesday, June 3", phase: "Study Leave", subject: "chem", time: "Morning (10AM-1PM)", title: "Redox Titrations & Periodic Trends", desc: "Drill stoichiometry redox problems and review d-block transition metal properties.", completed: false },
    { id: "gf-lead-wed-2", date: "Wednesday, June 3", phase: "Study Leave", subject: "bio", time: "Afternoon (2PM-5PM)", title: "Biology HL Paper 2 Timed Practice", desc: "Solve a full past Paper 2 Biology HL. Study data-based questions strategy.", completed: false },
    { id: "gf-lead-wed-3", date: "Wednesday, June 3", phase: "Study Leave", subject: "econ", time: "Evening (6PM-7:30PM)", title: "Econ Paper 3 Calculations Prep", desc: "Practice elasticity values, inflation index calculations, marginal tax rates, and linear functions.", completed: false },

    { id: "gf-lead-thu-1", date: "Thursday, June 4", phase: "Study Leave", subject: "span", time: "Morning (10AM-1PM)", title: "Spanish Writing Layout Check", desc: "Quick revision of layout formats: Folleto, Correo, Diario, Blog, Artículo. Review key verbs.", completed: false },
    { id: "gf-lead-thu-2", date: "Thursday, June 4", phase: "Study Leave", subject: "bio", time: "Afternoon (2PM-5PM)", title: "Bio/Chem Mistakes Summary", desc: "Do a final read through your mistakes log topics. Ensure formulas are clear.", completed: false },
    { id: "gf-lead-thu-3", date: "Thursday, June 4", phase: "Study Leave", subject: "span", time: "Evening (6PM-7:30PM)", title: "REST & Sleep Early", desc: "Prepare exam stationery (black pens, calculator, water). Sleep early for Spanish P1 tomorrow!", completed: false },

    // Phase 3: Mock Exams
    { id: "gf-exam-fri-1", date: "Friday, June 5", phase: "Mock Exams", subject: "exam", time: "7:50 AM", title: "📝 SPANISH AB INITIO P1 EXAM", desc: "Reading comprehension & vocabulary paper.", completed: false },
    { id: "gf-exam-fri-2", date: "Friday, June 5", phase: "Mock Exams", subject: "span", time: "Afternoon", title: "Spanish P2 & English P1 Prep", desc: "Review Spanish writing structures and English infographic analysis tips.", completed: false },

    { id: "gf-exam-mon-1", date: "Monday, June 8", phase: "Mock Exams", subject: "exam", time: "7:50 AM", title: "📝 SPANISH AB INITIO P2 EXAM", desc: "Writing paper.", completed: false },
    { id: "gf-exam-mon-2", date: "Monday, June 8", phase: "Mock Exams", subject: "exam", time: "10:00 AM", title: "📝 ENGLISH SL P1 EXAM", desc: "Infographics / textual analysis paper.", completed: false },
    { id: "gf-exam-mon-3", date: "Monday, June 8", phase: "Mock Exams", subject: "exam", time: "12:50 PM", title: "📝 CHEMISTRY HL P1 EXAM", desc: "Multiple choice paper.", completed: false },
    { id: "gf-exam-mon-4", date: "Monday, June 8", phase: "Mock Exams", subject: "chem", time: "Evening", title: "Chemistry HL Paper 2 Review", desc: "Final review of organic mechanisms, stoichiometry formulas, and kinetics.", completed: false },

    { id: "gf-exam-tue-1", date: "Tuesday, June 9", phase: "Mock Exams", subject: "exam", time: "7:50 AM", title: "📝 ENGLISH SL P2 EXAM", desc: "Gatsby vs Kite Runner comparison essay paper.", completed: false },
    { id: "gf-exam-tue-2", date: "Tuesday, June 9", phase: "Mock Exams", subject: "exam", time: "10:00 AM", title: "📝 CHEMISTRY HL P2 EXAM", desc: "Extended response chemistry paper.", completed: false },
    { id: "gf-exam-tue-3", date: "Tuesday, June 9", phase: "Mock Exams", subject: "bio", time: "Afternoon", title: "Biology HL Paper 1 & 2 Revision", desc: "Review cardiac cycle, photosynthesis steps, and genetic pedigree structures.", completed: false },

    { id: "gf-exam-wed-1", date: "Wednesday, June 10", phase: "Mock Exams", subject: "exam", time: "7:50 AM", title: "📝 BIOLOGY HL P1 EXAM", desc: "Multiple choice biology paper.", completed: false },
    { id: "gf-exam-wed-2", date: "Wednesday, June 10", phase: "Mock Exams", subject: "exam", time: "10:20 AM", title: "📝 BIOLOGY HL P2 EXAM", desc: "Extended response biology paper.", completed: false },
    { id: "gf-exam-wed-3", date: "Wednesday, June 10", phase: "Mock Exams", subject: "exam", time: "1:30 PM", title: "📝 ECONOMICS HL P1 EXAM", desc: "Micro/Macro essay choices.", completed: false },
    { id: "gf-exam-wed-4", date: "Wednesday, June 10", phase: "Mock Exams", subject: "econ", time: "Evening", title: "Economics HL P2 & Math P1 Prep", desc: "Review global economy and basic non-calculator calculus operations.", completed: false },

    { id: "gf-exam-thu-1", date: "Thursday, June 11", phase: "Mock Exams", subject: "exam", time: "7:50 AM", title: "📝 MATHS AASL P1 EXAM", desc: "Non-calculator mathematics paper.", completed: false },
    { id: "gf-exam-thu-2", date: "Thursday, June 11", phase: "Mock Exams", subject: "exam", time: "10:20 AM", title: "📝 ECONOMICS HL P2 EXAM", desc: "Data response economics paper.", completed: false },
    { id: "gf-exam-thu-3", date: "Thursday, June 11", phase: "Mock Exams", subject: "math", time: "Afternoon", title: "Maths AA SL P2 Prep", desc: "Graphing calculator active practice and statistic solver check.", completed: false },

    { id: "gf-exam-fri12-1", date: "Friday, June 12", phase: "Mock Exams", subject: "exam", time: "7:50 AM", title: "📝 MATHS AASL P2 EXAM", desc: "Calculator active mathematics paper.", completed: false },
    { id: "gf-exam-fri12-2", date: "Friday, June 12", phase: "Mock Exams", subject: "exam", time: "Afternoon", title: "🎉 MOCKS ARE OVER!", desc: "Time to relax and celebrate!", completed: false }
];

// Sync updates to Firestore
window.pushStateToFirestore = function() {
    if (window.isUpdatingFromFirestore) return;
    
    const docId = (window.currentUser === 'GF') ? 'gf_dashboard' : 'dashboard';
    window.db.collection('study_data').doc(docId).set({
        agenda: window.agenda,
        shifts: window.shifts,
        activeSession: window.activeSession,
        timetable: window.timetable,
        blueprintCheckboxes: window.blueprintCheckboxes,
        mistakes: window.mistakes,
        blueprintTasks: window.blueprintTasks
    }, { merge: true }).catch(err => {
        console.error("Firestore write failed (offline sync buffered):", err);
    });
};

// Listen and sync with DB for current user
window.loadUserData = function(user) {
    window.currentUser = user;
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
    const localBlueprintTasks = JSON.parse(localStorage.getItem(storagePrefix + 'blueprint_tasks')) || (user === 'GF' ? window.defaultBlueprintTasksMahi : []);
    
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

    if (typeof window.triggerUIUpdates === 'function') {
        window.triggerUIUpdates();
    }

    // Start Real-Time Firestore Sync Listener
    window.unsubscribeFirestore = window.db.collection('study_data').doc(docId).onSnapshot((doc) => {
        if (!doc.exists) {
            console.log("No remote database document found for: " + docId + ". Uploading local cache as backup...");
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
            window.blueprintTasks = data.blueprintTasks || (user === 'GF' ? window.defaultBlueprintTasksMahi : []);
            
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
            
            Object.keys(window.blueprintCheckboxes).forEach(taskId => {
                localStorage.setItem(storagePrefix + taskId, window.blueprintCheckboxes[taskId]);
            });
            
            // Trigger UI rendering
            if (typeof window.triggerUIUpdates === 'function') {
                window.triggerUIUpdates();
            }
            
            window.isUpdatingFromFirestore = false;
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
    'BF': { today: 0, total: 0, active: false, subject: '' },
    'GF': { today: 0, total: 0, active: false, subject: '' }
};

// Start background listener for the entire collection to sync competition scores and live statuses
window.db.collection('study_data').onSnapshot((querySnapshot) => {
    const todayStr = new Date().toDateString();
    
    querySnapshot.forEach((doc) => {
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
            subject: data.activeSession ? data.activeSession.subject : ''
        };
    });
    
    // Trigger comparison widget redraw
    if (typeof window.renderCompetitionWidget === 'function') {
        window.renderCompetitionWidget();
    }
}, (error) => {
    console.error("Collection snapshot error for comparison:", error);
});
