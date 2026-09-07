// The shared config verbatim, with nothing overridden. The two settings this
// repo used to disagree on — `semi: false` and `printWidth: 100` — were local
// habit, not a decision, and keeping them would have meant carrying a fork of a
// config whose whole point is that it is shared.
//
// `printWidth: 80` is the one that has teeth: it is what makes the
// `.changeset/config.json` entry in `.prettierignore` load-bearing rather than
// precautionary. Read the comment there before touching either file.
export { default } from '@jperezmart/prettier-config';
