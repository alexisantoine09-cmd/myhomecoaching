/**
 * Script Google Apps Script - Formulaire Coach Sportif
 *
 * Ce script crée automatiquement un Google Form structuré pour
 * le suivi hebdomadaire des clients d'un coach sportif à domicile.
 * Les réponses sont enregistrées dans un Google Sheet lié.
 */

function creerFormulaireCoach() {

  // ── Création du formulaire ──────────────────────────────────────────────────
  var form = FormApp.create("Suivi hebdomadaire – Coach Sportif");
  form.setDescription(
    "Merci de remplir ce formulaire chaque semaine avant votre séance. " +
    "Vos réponses m'aideront à adapter au mieux votre programme."
  );
  form.setCollectEmail(false);
  form.setAllowResponseEdits(true);
  form.setLimitOneResponsePerUser(false);


  // ══════════════════════════════════════════════════════════════════════════
  // SECTION 1 – Informations personnelles
  // ══════════════════════════════════════════════════════════════════════════
  form.addSectionHeaderItem()
    .setTitle("1. Informations personnelles");

  form.addTextItem()
    .setTitle("Nom et prénom")
    .setHelpText("Ex : Jean Dupont")
    .setRequired(true);

  form.addTextItem()
    .setTitle("Âge")
    .setHelpText("En années")
    .setRequired(true);

  form.addTextItem()
    .setTitle("Numéro de téléphone")
    .setHelpText("Ex : 06 12 34 56 78")
    .setRequired(true);


  // ══════════════════════════════════════════════════════════════════════════
  // SECTION 2 – Bilan de forme
  // ══════════════════════════════════════════════════════════════════════════
  form.addSectionHeaderItem()
    .setTitle("2. Bilan de forme")
    .setHelpText("Comment vous sentez-vous cette semaine ?");

  // Échelle fatigue 1-10
  form.addScaleItem()
    .setTitle("Niveau de fatigue cette semaine")
    .setHelpText("1 = Pas fatigué du tout · 10 = Épuisé")
    .setBounds(1, 10)
    .setLabels("Pas fatigué", "Épuisé")
    .setRequired(true);

  // Échelle sommeil 1-10
  form.addScaleItem()
    .setTitle("Qualité du sommeil")
    .setHelpText("1 = Très mauvais · 10 = Excellent")
    .setBounds(1, 10)
    .setLabels("Très mauvais", "Excellent")
    .setRequired(true);

  // Douleurs (oui/non)
  var douleursItem = form.addMultipleChoiceItem()
    .setTitle("Avez-vous des douleurs ou gênes à signaler ?")
    .setChoiceValues(["Oui", "Non"])
    .setRequired(true);

  // Zone du corps si douleur (question conditionnelle)
  form.addCheckboxItem()
    .setTitle("Si oui, quelle(s) zone(s) du corps ?")
    .setHelpText("Cochez toutes les zones concernées (laissez vide si Non)")
    .setChoiceValues([
      "Nuque / Cou",
      "Épaule droite",
      "Épaule gauche",
      "Dos (haut)",
      "Dos (bas) / Lombaires",
      "Genou droit",
      "Genou gauche",
      "Cheville / Pied",
      "Hanche",
      "Autre"
    ]);


  // ══════════════════════════════════════════════════════════════════════════
  // SECTION 3 – Suivi de la séance précédente
  // ══════════════════════════════════════════════════════════════════════════
  form.addSectionHeaderItem()
    .setTitle("3. Suivi de la séance précédente")
    .setHelpText("Votre retour sur notre dernière séance ensemble.");

  form.addMultipleChoiceItem()
    .setTitle("Comment avez-vous vécu l'intensité de la séance ?")
    .setChoiceValues([
      "Trop difficile",
      "Bien dosée – parfaite pour moi",
      "Un peu facile",
      "Trop facile"
    ])
    .setRequired(true);

  form.addParagraphTextItem()
    .setTitle("Points positifs de la séance")
    .setHelpText("Qu'est-ce qui vous a plu ou bien fonctionné ?");

  form.addParagraphTextItem()
    .setTitle("Points à améliorer")
    .setHelpText("Qu'est-ce qui pourrait être ajusté pour la prochaine fois ?");


  // ══════════════════════════════════════════════════════════════════════════
  // SECTION 4 – Motivation & objectifs
  // ══════════════════════════════════════════════════════════════════════════
  form.addSectionHeaderItem()
    .setTitle("4. Motivation & objectifs");

  // Échelle motivation 1-10
  form.addScaleItem()
    .setTitle("Niveau de motivation cette semaine")
    .setHelpText("1 = Aucune envie · 10 = Ultra motivé(e)")
    .setBounds(1, 10)
    .setLabels("Aucune envie", "Ultra motivé(e)")
    .setRequired(true);

  form.addCheckboxItem()
    .setTitle("Objectif(s) prioritaire(s) du moment")
    .setHelpText("Vous pouvez cocher plusieurs réponses.")
    .setChoiceValues([
      "Perte de poids / Perte de masse grasse",
      "Gain musculaire / Tonification",
      "Amélioration de l'endurance",
      "Bien-être & gestion du stress",
      "Rééducation / Prévention des blessures",
      "Performance sportive",
      "Autre"
    ])
    .setRequired(true);


  // ══════════════════════════════════════════════════════════════════════════
  // SECTION 5 – Message libre
  // ══════════════════════════════════════════════════════════════════════════
  form.addSectionHeaderItem()
    .setTitle("5. Message libre")
    .setHelpText("Un espace rien que pour vous.");

  form.addParagraphTextItem()
    .setTitle("Y a-t-il quelque chose que vous souhaitez me partager ?")
    .setHelpText(
      "Question, ressenti, événement de vie, contrainte de planning… " +
      "Tout ce qui pourrait être utile pour adapter votre suivi."
    );


  // ── Lier un Google Sheet pour stocker les réponses ─────────────────────────
  var spreadsheet = SpreadsheetApp.create("Réponses – Suivi Coach Sportif");
  form.setDestination(FormApp.DestinationType.SPREADSHEET, spreadsheet.getId());

  // ── Affichage des URLs dans les logs ───────────────────────────────────────
  var formUrl       = form.getPublishedUrl();
  var formEditUrl   = form.getEditUrl();
  var spreadsheetUrl = spreadsheet.getUrl();

  Logger.log("✅ Formulaire créé avec succès !");
  Logger.log("────────────────────────────────────────────────");
  Logger.log("🔗 URL du formulaire (à envoyer aux clients) :");
  Logger.log(formUrl);
  Logger.log("────────────────────────────────────────────────");
  Logger.log("✏️  URL d'édition du formulaire (pour vous) :");
  Logger.log(formEditUrl);
  Logger.log("────────────────────────────────────────────────");
  Logger.log("📊 Google Sheet des réponses :");
  Logger.log(spreadsheetUrl);
  Logger.log("────────────────────────────────────────────────");
}
