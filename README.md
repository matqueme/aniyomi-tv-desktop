# Aniyomi Tizen - Samsung Smart TV App

Application Aniyomi adaptée pour les téléviseurs Samsung Smart TV utilisant Tizen OS.

## Prérequis

- Node.js et pnpm installés
- Tizen Studio installé
- Samsung TV en mode développeur

## Configuration de votre Samsung TV

1. Activez le mode développeur sur votre TV :

   - Accédez aux Paramètres > Support > Informations TV
   - Appuyez sur `12345` sur la télécommande
   - Activez le "Mode développeur"
   - Redémarrez votre TV

2. Notez l'adresse IP de votre TV dans les paramètres réseau

## Installation et Build

1. Installez les dépendances :

```bash
pnpm install
```

2. Construisez l'application pour Tizen :

```bash
pnpm run build:tizen
```

## Déploiement sur Samsung TV

### Méthode 1 : Via Tizen Studio (Recommandé)

1. Buildez d'abord l'application :

```bash
pnpm run build:tizen
```

2. Ouvrez Tizen Studio

3. Importez le projet :

   - File → Import
   - General → Existing Projects into Workspace
   - Sélectionnez le dossier `.tizen-package`
   - Cochez "Copy projects into workspace" (optionnel)
   - Cliquez Import

4. Le projet "aniyomi-tizen" devrait maintenant apparaître dans votre workspace

5. Configurez votre certificat de développeur :

   - Tools → Certificate Manager
   - Créez un nouveau certificat pour Samsung TV

6. Connectez-vous à votre TV :

   - Tools → Device Manager
   - Ajoutez votre TV avec son IP
   - Connectez-vous

7. Lancez l'application :
   - Clic droit sur le projet → Run As → Tizen Web Application

### Méthode 2 : Via CLI Tizen (si configuré)

1. Créez un certificat :

```bash
pnpm run tizen:certificate
```

2. Packagez l'application :

```bash
pnpm run tizen:package
```

3. Installez sur la TV (remplacez par l'IP de votre TV) :

```bash
tizen connect 192.168.1.XXX
tizen install -n aniyomi-tizen.wgt -t UE65TU7125
```

## Structure du Projet

```
aniyomi-tizen/
├── config.xml              # Configuration Tizen
├── icon.svg                # Icône de l'application
├── build-tizen.ps1         # Script de build Windows
├── src/
│   ├── components/
│   │   └── TvNavigation.vue # Interface TV principale
│   ├── utils/
│   │   └── tizen.js        # Utilitaires Tizen
│   └── ...
└── .tizen-package/         # Build final pour Tizen
```

## Fonctionnalités TV

- Navigation avec les flèches directionnelles
- Support des boutons colorés de la télécommande
- Interface adaptée aux écrans 1920x1080
- Gestion des focus pour la navigation TV
- Support des API Tizen

## Contrôles de la Télécommande

- **Flèches directionnelles** : Navigation
- **OK/Enter** : Sélection
- **Return/Back** : Retour
- **Boutons colorés** : Actions spéciales

## Développement

Pour développer en mode développement :

```bash
pnpm run dev
```

L'application sera disponible sur `http://localhost:3000`

## Dépannage

### L'application ne se lance pas

- Vérifiez que le mode développeur est activé
- Assurez-vous que le certificat est bien configuré
- Vérifiez les logs dans Tizen Studio

### Navigation ne fonctionne pas

- Vérifiez que les événements de touches sont bien capturés
- Testez avec les touches du navigateur lors du développement

### Problèmes de performance

- Optimisez les images et ressources
- Réduisez les animations CSS complexes
- Utilisez le build de production

## Configuration Avancée

### Modification de l'ID d'application

Editez `config.xml` et changez l'attribut `id` du widget.

### Ajout de privilèges

Ajoutez les privilèges nécessaires dans `config.xml` :

```xml
<tizen:privilege name="http://tizen.org/privilege/PRIVILEGE_NAME"/>
```

### Configuration de l'icône

Remplacez `icon.svg` par votre propre icône (recommandé : 117x117px).

## Support

Pour les questions spécifiques à Tizen, consultez :

- [Documentation Tizen](https://developer.tizen.org/development/web-application)
- [Samsung Smart TV Developer](https://developer.samsung.com/smarttv)
