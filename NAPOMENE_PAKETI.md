# Napomene o paketima i ranjivostima

## Instalirani paketi

Svi potrebni paketi su instalirani. Ako npm audit prikazuje ranjivosti, one su obično u development dependencies i ne utječu na produkciju.

## Važne napomene

### file-type paket
`file-type` paket je u `devDependencies`, ali se koristi u produkciji. Ako se pojavi greška, možda ga treba premjestiti u `dependencies` ili koristiti drugačiji pristup za validaciju slika.

### bcryptjs
Koristi se za hashiranje lozinki. Ako se pojave problemi s importom, možda treba koristiti:
```typescript
const bcrypt = require("bcryptjs");
```

### next-auth beta
Koristi se NextAuth v5 beta verzija. Ako se pojave problemi, možda treba koristiti stabilnu verziju v4.

## Rješavanje ranjivosti

Ako npm audit prikazuje ranjivosti:

1. **Provjeri koje su ranjivosti** - obično su u development dependencies
2. **Ažuriraj pakete** - `npm update` ili `npm audit fix`
3. **Za breaking changes** - provjeri changelog prije `npm audit fix --force`

## Testiranje nakon instalacije

Nakon instalacije paketa, provjeri:
1. Da li se aplikacija kompajlira: `npm run build`
2. Da li development server radi: `npm run dev`
3. Da li se greške pojavljuju u konzoli

