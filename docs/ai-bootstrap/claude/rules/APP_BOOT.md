# App Boot

## Init order (`App.tsx`)
`initAuth` → `initAds` → `subscribeAuth` → `loadGame` → IAP listeners

## IAP
`verifyPurchaseOnServer` → `applyPurchaseToStore` → `_persist`

## Imports
Use `@navigation`, `@store` aliases. Load `global.css` first.
