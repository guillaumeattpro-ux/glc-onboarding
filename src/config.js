const config = {
    // IDENTITÉ
    nom: "Gentleman Létal Club",
    programme: "Avril 2026",
    tagline: "Le mois le moins confortable de ta vie · Be The Guy",
    citation: "Le confort est l'ennemi du progrès",
    citation_auteur: "Gentleman Létal, Avril 2026",

    // VIDEO D'ACCUEIL — URL embed YouTube ou fichier .mp4 dans public/
    welcome_video: {
      src: "https://www.youtube.com/watch?v=FIgVTGF2bMs",
      poster: "",
    },
  
    // PROCHAIN CALL
    prochain_call: {
      date: "2026-04-09T20:00:00",
      label: "Call de groupe — Jeudi 20h"
    },
  
    // COACH
    coach_password: "glc2026",
  
    // CONTRAT
    contrat: `CONTRAT D'ENGAGEMENT — GENTLEMAN LÉTAL CLUB
  
  En rejoignant le programme Avril 2026, je m'engage à :
  
  1. Être présent à chaque call de groupe sans exception
  2. Compléter mes routines quotidiennes 6 jours sur 7
  3. Être honnête sur mes blocages et demander de l'aide
  4. Livrer mes objectifs hebdomadaires chaque dimanche soir
  5. Donner le meilleur de moi-même pendant toute la durée du programme
  
  Je comprends que ce programme est conçu pour me pousser hors de ma zone de confort. J'accepte l'inconfort comme outil de croissance.
  
  Fait à _____________________, le _____________________`,
  
    // QUESTIONNAIRE — 15 questions, 5 blocs
    questionnaire: [
      // BLOC 1
      { bloc: "L'état des lieux", question: "Si tu devais décrire ta vie actuelle en 3 mots, lesquels choisirais-tu ? Pourquoi ces mots ?" },
      { bloc: "L'état des lieux", question: "Quel domaine de ta vie te pèse le plus en ce moment ? (travail, relations, santé, finances, sens…)" },
      { bloc: "L'état des lieux", question: "Qu'est-ce que tu fais aujourd'hui que tu fais \"par défaut\" plutôt que par choix ?" },
      // BLOC 2
      { bloc: "Ce que tu veux vraiment", question: "Dans 3 ans, à quoi ressemble une journée idéale pour toi ? Décris-la concrètement." },
      { bloc: "Ce que tu veux vraiment", question: "Qu'est-ce que tu veux vraiment — pas ce que tu \"devrais\" vouloir, pas ce qu'on attend de toi ?" },
      { bloc: "Ce que tu veux vraiment", question: "Qu'est-ce qui te manque aujourd'hui pour te sentir pleinement vivant(e) ?" },
      // BLOC 3
      { bloc: "Les blocages réels", question: "Qu'est-ce qui t'a empêché jusqu'ici d'avancer vers ce que tu veux ? Sois honnête." },
      { bloc: "Les blocages réels", question: "Quelle est la peur que tu n'oses pas nommer à voix haute ?" },
      { bloc: "Les blocages réels", question: "Qu'est-ce que tu continues de te raconter sur toi-même qui te freine ?" },
      // BLOC 4
      { bloc: "Tes ressources", question: "À quel moment de ta vie tu t'es senti(e) le plus fort(e) / le plus aligné(e) ? Qu'est-ce qui a rendu ça possible ?" },
      { bloc: "Tes ressources", question: "Qu'est-ce que les gens qui te connaissent bien voient en toi, que toi tu as du mal à voir ?" },
      { bloc: "Tes ressources", question: "Qu'est-ce que tu es prêt(e) à changer, vraiment — même si c'est inconfortable ?" },
      // BLOC 5
      { bloc: "L'engagement", question: "Si tu ne changes rien dans les 6 prochains mois, tu en es où ?" },
      { bloc: "L'engagement", question: "Qu'est-ce que ça changerait pour toi — et pour les gens autour de toi — si tu atteignais ce que tu veux ?" },
      { bloc: "L'engagement", question: "Par quoi tu veux commencer ?" },
    ],
  
    // RESSOURCES DASHBOARD
    ressources: {
      communaute: [
        { label: "Skool GLC", url: "https://skool.com/glc" },
        { label: "WhatsApp Groupe", url: "https://chat.whatsapp.com/glc" },
        { label: "Instagram GLC", url: "https://instagram.com/glc" },
      ],
      programme: [
        { label: "Module 1 — Mindset", url: "#" },
        { label: "Guide de démarrage", url: "#" },
        { label: "Notion du programme", url: "#" },
      ]
    },
  
    // ÉVÉNEMENTS CALENDRIER
    evenements: {
      1: "Lancement",
      7: "Semaine 1",
      14: "Mi-mois",
      15: "Stress Day",
      21: "Semaine 3",
      22: "Dark Week",
      28: "Sprint Final",
      31: "Victoire"
    }
  }
  
  export default config