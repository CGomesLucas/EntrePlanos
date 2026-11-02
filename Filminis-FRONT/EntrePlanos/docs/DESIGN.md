# Figma audit and implementation map

Source: [Filminis / Ui Design](https://www.figma.com/design/wuMRPOTl3tT01fXv4PuNKR/Filminis?node-id=0-1).

## Visual foundations

The supplied frames are 1440px desktop designs. The homepage is 2048px tall; most inner pages are 1024px. No mobile/tablet frames or breakpoint specifications were returned. Responsive behavior at 320px, 768px and 1024px is an implementation decision: two/four/six poster columns, stacked mobile forms, wrapped navigation and horizontally scrollable admin tables.

| Token                   | Design value                            |
| ----------------------- | --------------------------------------- |
| Background              | #191919                                 |
| Surface                 | #292929                                 |
| Text                    | #FAF8F4                                 |
| Primary action          | #A83F35                                 |
| Highlight / selected    | #E7B66D                                 |
| Typography              | Google Sans Flex; Antonio Bold wordmark |
| Desktop gutter / header | 64px / 80px                             |
| Poster                  | 212 × 296px, 2px border, 4px radius     |
| Spacing                 | 4, 8, 16, 24, 32, 64px                  |

Fonts are hosted locally with their OFL licenses. SVG icons retain their original intrinsic dimensions. All static images used by the app were downloaded from the returned Figma assets. Movie posters, cast information and profile pictures remain data-driven; the example people and film records from Figma are not presented as live account data.

## Screen mapping

| Figma node | Screen                  | Implementation                                                           |
| ---------- | ----------------------- | ------------------------------------------------------------------------ |
| 31:2       | Main Page               | CatalogPage, homepage hero and two collections                           |
| 90:260     | Login                   | LoginPage, split visual/form layout; registration shares form primitives |
| 98:263     | Film Screen             | MoviePage, poster, facts, synopsis, cast, favorite action                |
| 73:397     | Profile                 | ProfilePage, cover, avatar, tabs, favorites                              |
| 113:711    | Add step 1              | MovieFormPage, main information and category chips                       |
| 117:1783   | Add step 2              | MovieFormPage, production and cast choices                               |
| 122:1962   | Admin success           | MovieFormPage success view with original cinema image                    |
| 103:574    | Admin edit              | MovieFormPage, complete editable form                                    |
| 118:3153   | Admin management        | AdminPage, status tabs, search, table, approval and deletion             |
| 122:2017   | My requests             | Profile tab; clearly states missing backend support                      |
| 88:359     | Search                  | CatalogPage search variant; design-context request timed out             |
| 122:2570   | Personal data           | ProfilePage form using retrieved profile foundation                      |
| 118:2862   | User submission success | MovieFormPage confirmation using retrieved submission foundations        |
| 101:574    | Auth film view          | MoviePage read-only details; no duplicate static form                    |

Figma Starter-plan limits prevented high-fidelity context retrieval for 122:2570, 118:2862 and 101:574. Their functionality reuses the retrieved components; exact visual parity for those frames and the timed-out search frame remains unverified. Static reference counts, names, budgets and marketing statistics are replaced by live data or omitted when unsupported.

## Component hierarchy and states

App owns routing, session and favorites. Layout owns navigation and categories. Pages own resource loading and mutations. Button, Field, Poster, MovieGrid, ChoiceGroup and Status are reusable presentation components. Data access stays in services/api.js; hooks own cancellation, authentication, routing and local favorites.

Buttons include hover, keyboard focus, disabled and busy states. Chips expose pressed state. Resource views include loading, empty, error and retry states. Submission steps preserve their draft when navigating backward. Successful mutations have live status messages. Delete requires an explicit confirmation of the selected film. Protected screens check roles; backend authorization remains authoritative.
