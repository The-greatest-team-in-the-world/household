# Inlämning 2 - Hushållet

I den här inlämningen ska ni i grupp om 5 skapa en nativ app med med hjälp av React Native (RN), Expo och Typescript. Applikationen ni har fått i uppdrag att bygga heter Hushållet. Nedan följer information om applikationen inklusive en kravlista över det som ska göras.

- **Syfte**: Göra det lättare att samsas kring och bli påmind om sysslor i hemmet.
- **Målgrupp**: Familjer, sambos, släktingar.
- **Produktägare**: David Jensen.
- **Avatarer**: 🦊 🐷 🐸 🐥 🐙 🐬 🦉 🦄
- **Läs noga igenom hela uppgiftsbeskrivningen innan ni börjar.**

### Kravlista

- G: 20 (50%).
- VG: 32 (80%).

### Kravlista (4)

- [x] **En logga, splashscreen och appikon ska designas och användas.**
- [x] **Applikationen ska byggas med RN, Expo & TS.**
- [x] **Designen av appen ska utgå ifrån befintliga skisser, undantag kan ges men ska diskuteras med produktägare, godkännas och dokumenteras.**
- [x] Information ska kommuniceras till och från en server.

### Hushåll (7)

- [x] **Ett hushåll ska ha ett namn och en genererad (enkel) kod så andra kan gå med i hushållet, namnet ska gå att ändra.**
- [x] Alla användare i ett hushåll ska kunna se vilka som tillhör ett hushåll.
- [x] En ägare av ett hushåll ska kunna se förfrågningar om att gå med i hushållet.
- [x] En ägare ska kunna acceptera eller neka förfrågningar.
- [x] En ägare ska kunna göra andra till ägare.
- [x] En ägare ska kunna pausa en användare och under pausade perioder ska användare inte tas med i statistiken.
- [x] Om en användaer har pausats under en del av en period i statistiken ska graferna normaliseras.

### Konto (5)

- [x] **En användare ska kunna registrera och logga in sig.**
- [x] **En användare ska kunna skapa ett nytt hushåll.**
- [x] **En användare ska kunna gå med i ett hushåll genom att ange hushållets kod.**
- [x] När en användare har valt att gå med i ett hushåll behöver en ägare av hushållet först godkänna användaren.
- [x] En användare ska kunna lämna ett hushåll.

### Profil (6)

- [x] **En användare ska kunna ange sitt namn.**
- [x] **En användare ska kunna välja en avatar (emoji-djur + färg) från en fördefinierad lista.**
- [x] **Valda avatarer ska inte kunna väljas av andra användare i hushållet.**
- [x] **Avataren ska användas i appen för att visa vad användaren har gjort.**
- [x] En användare ska kunna ställa in appens utseende (mörkt, ljust, auto).
- [x] Om en användare tillhör två eller fler hushåll ska denne kunna välja att byta mellan de olika hushållen.

### Sysslor (6)

- [x] **En ägare ska kunna lägga till sysslor att göra i hemmet.**
- [x] **En syssla ska ha ett namn, en beskrivning (text), hur ofta den ska göras (dagar), och en vikt som beskriver hur energikrävande den är.**
- [x] En användare ska kunna lägga till en ljudinspelning och en bild för att beskriva sysslan ytterligare.
- [x] **En ägare ska kunna redigera en syssla.**
- [x] En ägare ska kunna ta bort en syssla.
- [x] När en syssla tas bort ska användaren få en varning om att all statistik gällande sysslan också kommer att tas bort och få valet att arkivera sysslan istället.

### Dagsvyn (3)

- [x] **Alla sysslor ska listas i en dagsvy och ge en översikt kring vad som behöver göras.**
- [x] **Utöver sysslans namn ska även vem/vilka som har gjort sysslan visas, hur många dagar sedan sysslan gjordes senast samt om den är försenad.**
- [x] **När en användare väljer en syssla ska beskrivningen av sysslan visas och det ska även med ett enkelt tryck gå att markera sysslan som gjord.**

### Statistik (6)

- [x] **En användare ska kunna se fördelningen av gjorda sysslor mellan användarna i sitt hushåll.**
- [x] **Varje statistikvy ska visa den totala fördelningen (inräknat vikterna för sysslorna) samt fördelning av varje enskild syssla.**
- [x] **Det ska finnas en statistikvy över ”nuvarande vecka”.**
- [x] Det ska finnas en statistikvy över ”förra vecka”.
- [x] Det ska finnas en statistikvy över ”förra månaden”.
- [x] Om det inte finns statistik för en av vyerna ska den vyn inte visas.

### Schemaläggning (3)

- [x] En ägare ska kunna tilldela och ta bort sysslor från användare i hushållet.
- [x] Användare ska kunna se de tilldelade sysslorna i sitt gränssnitt.
- [ ] En ägare ska kunna skapa grupper av sysslor som automatiskt tilldelas användarna i hushållet och roteras baserat på ett intervall i dagar.

## Inlämning

För att bli godkänd på den här uppgiften MÅSTE ni använda GIT och GitHub. Inlämningen sker som vanligt via läroplattformen. I din projektmapp ska det finnas (utöver all kod) en README.md fil. Den ska innehålla en titel, beskrivning av projektet, info om hur projektet byggs och körs samt vilka krav som är uppfyllda. Samt en .git mapp så jag kan hitta till erat publika repo.

### Presentation

Presentationen är uppdelad i tre moment. Det första momentet är en pitch på cirka 2-3 minuter där ni ska försöka sälja in era lösningar och designval. Den andra delen är ett demo av applikationen. Slutligen ska ni reflektera kring projektet. Varje grupp har ca 20 minuter på sig.

### Opponering & Individuell reflektion

I slutet av kursen ska ni genomföra en opponering på varandras arbeten och i samband med det även lämna in en individuell reflektion. Ni kommer få ut mer information om hur det kommer att gå till längre fram.

## Betyg

### Krav för godkänt:

1. [x] De nödvändiga kraven ifrån kravlistan ovan är uppfyllda
2. [x] Applikationen kommunicerar data till och från en backend tjänst (ni väljer).
3. [x] Git & GitHub har använts.
4. [x] Projektmappen innehåller en README.md fil - (läs ovan för mer info)
5. [x] Uppgiften lämnas in i tid!
6. [x] Muntlig presentation är genomförd

### Krav för väl godkänt:

7. [x] Alla punkter för godkänt är uppfyllda
8. [x] Ni har använt CI<del>/CD</del> under projektet.
