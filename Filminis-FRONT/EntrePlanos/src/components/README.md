# Reusable UI components

All components use JavaScript functions and declare PropTypes. Native input and button attributes are forwarded where relevant. React 19 does not execute PropTypes validation automatically; declarations document the public contract. Browser form constraints and API responses perform actual validation.

| Component   | Props                                                                 | Purpose                                                      |
| ----------- | --------------------------------------------------------------------- | ------------------------------------------------------------ |
| Layout      | children, user?, onLogout, overlay?                                   | Shared header, category menu, account links, footer          |
| Button      | children, secondary?, busy?, disabled?, className?, native attributes | Action variants, native disabled and aria-busy               |
| Field       | label, multiline?, native input/textarea attributes                   | Wrapping label with controlled or uncontrolled input         |
| Status      | loading?, error?, onRetry?, empty?                                    | Accessible resource loading, alert and empty states          |
| Poster      | src?, title?, className?                                              | Validates image protocol; fallback for missing/broken images |
| MovieGrid   | movies: {id, titulo, imagem}[]                                        | Responsive links to film details                             |
| ChoiceGroup | label, options: {id, nome, sobrenome?}[], value: id[], onChange       | Multi-selection chips with aria-pressed                      |

```jsx
<Field label="Título" value={title} onChange={event => setTitle(event.target.value)} required />
<Button type="submit" busy={saving}>Salvar</Button>
<Status loading={loading} error={error} onRetry={reload} />
```

Styles live in styles/app.css; colors, typography and spacing are centralized in styles/tokens.css. Keep API calls in pages/hooks rather than these presentation components.
