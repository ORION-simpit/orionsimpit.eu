# ORION SimPit Website

Site officiel de **ORION SimPit** — <https://orionsimpit.eu>

## Objectif

Cette v0.1 est volontairement statique et sans framework afin de permettre un déploiement GitHub Pages immédiat, avec une surface technique minimale.

## Fichiers

- `index.html` — landing page publique
- `styles.css` — charte visuelle ORION v0.1
- `script.js` — interactions légères et accessibles
- `CNAME` — domaine personnalisé GitHub Pages

## Déploiement

GitHub Pages doit publier la branche `main` depuis `/ (root)`.

Le domaine principal est `orionsimpit.eu` et `www.orionsimpit.eu` doit rediriger vers celui-ci via la configuration DNS/GitHub Pages.

## Principes visuels

- fond noir/bleu très sombre ;
- accent cyan lumineux ;
- interfaces sobres inspirées des cockpits et HUD de simulation ;
- animations discrètes ;
- responsive et respect de `prefers-reduced-motion`.

## À venir

- intégration du logo vectoriel officiel ;
- liens Discord et YouTube officiels ;
- page documentation ;
- page roadmap détaillée ;
- formulaire pilote alpha ;
- optimisation SEO/social preview.

## Transition du CTA après l’Alpha

Les libellés « Rejoindre l’alpha » et « Accès privé • Alpha test » restent intégrés à
l’asset raster pour cette publication. Avant la sortie publique, le CTA et son sous-texte
devront être retirés de l’image, rendus en HTML localisable et pilotés par configuration.
La mention « Alpha test » sera alors supprimée et le CTA renommé selon l’action finale
retenue.
