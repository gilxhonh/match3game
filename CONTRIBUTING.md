# Contributing guide

*Do not try to update or remove this file, it will be automatically added and updated by the CI.*

- [Contributing guide](#contributing-guide)
	- [General notice](#general-notice)
	- [Git](#git)
		- [Branch model](#branch-model)
		- [Merge request](#merge-request)
		- [Commit style](#commit-style)
	- [Game development good practices](#game-development-good-practices)
		- [tslint & editorconfig](#tslint--editorconfig)
		- [Code style](#code-style)
		- [Before delivery](#before-delivery)
	- [Versioning and delivering](#versioning-and-delivering)
		- [Versioning](#versioning)
		- [Changelog and limitations](#changelog-and-limitations)
		- [Partial delivery](#partial-delivery)
		- [Delivering](#delivering)
			- [For internal developers](#for-internal-developers)
			- [For external studio developers](#for-external-studio-developers)

## General notice

Please **read carefully** this readme and the associated documentation pages before working on a game.
The **strict respect** of the rules listed here is **mandatory** to ensure the **proper functioning** of the gitlab Continuous Integration and Continuous **Delivery** processes (CI/CD).

Note that most of the time, versioning will be automatically handled by the CD, so you should not touch the version in the `package.json`. Read more about versioning [here](#versioning).

## Git

We expect you to be **familiar with git branching** to understand the following rules. If not, please go there: https://learngitbranching.js.org/

### Branch model

Main branch is `master`.
- **Only** maintainers can merge or push on this branch.
- `master` branch is **protected**: **nobody** can push force on it.
- Assume that `master` = **production**: Everything merged on will be straightforwardly delivered by the CD.

`dev` branch is your working branch.
- When you are ready to deliver, merge `dev` branch into `master`.
- When you start re-working on a game, merge `master` into `dev` (to be sure to have the version commit generated by the CD).
- `dev` branch should be **protected**. We strongly recommend you to work on other branches.

When you need to work on a new feature, refact, bugfix... create a branch starting at the top of `dev`. Name it accordingly to the nature of your modifications: *feat/reveal-mechanics, bugfix/qa-v1.0.3-feedbacks, refact/home-buttons, style/lint-errors, chore/gdk-dependencies...*

You should always submit your branch to a peer review before merging it into `dev`.

### Merge request

Indeed, to merge a feature/refact/bugfix into `dev` or to merge `dev` into `master`, you must create a merge request on gitlab.

It is **mandatory** that at least one of the mandated peer reviewers approve your code all along the development process in order to help you improve your understanding of the GDK and to improve the quality of your code and thus of your game.

In order to facilitate the reviews, you **MUST**, as much as possible, organize your code modifications in well named & scoped branches/commits, and submit pull requests regularly (not just before the delivery!!!). For this purpose and to ensure a good traceability of the development of a game.

Note that we will not review code of external studio games. You are the guarantor of the quality of your code. We will only ensure that the `.gitlab-ci.yml` is properly updated and the CI will check that the code lints and builds.

### Commit style

We are using [AngularJS's commit message convention](https://github.com/angular/angular.js/blob/master/DEVELOPERS.md#-git-commit-guidelines) for commit message nomenclature.
Commits message will be used to generate **the changelog** of your delivery, so you **MUST** make commit name accordingly to the rules.
You can use the command `npm run commit` to help you to write commits message.

Complete list of rules of commit style can be found here: https://doc.gdk.fdj-gs.com/documentation/get-started/gdk-300/302-git.html#commit
You **MUST** read it!

## Game development good practices

### tslint & editorconfig

We enforce code style rules in order to easier games maintenance, to make faster code reviews and to decrease the risk of bugs generation.
For that, we provide a [tslint](https://palantir.github.io/tslint/) plugin and a `.editorconfig` file.

You **MUST** ensure that your code lints before each **commit**.

You can read more about our tslint plugin here: https://doc.gdk.fdj-gs.com/documentation/get-started/gdk-200/203-clean-code.html#tslint-gdk-gamelint

### Code style

Besides the tslint and the editorconfig, we want you to follow as much as possible some rules referenced here: https://doc.gdk.fdj-gs.com/documentation/get-started/gdk-200/203-clean-code.html#code-rules
Once again, the purpose of these rules is to make to have faster code reviews, but also to facilitate the maintenance of your game. Indeed, there is a good chance that someone other than you will be working on this project in the future, so make it as easy as possible for them to do so.

### Before delivery

Before any commit, you must ensure that your game **builds and lints** (unless, of course, it is a temporary commit).

Before delivery, aka before merging `dev` into `master`, you must ensure the quality of your game.
Please read carrefuly this page of the documentation to do so: https://doc.gdk.fdj-gs.com/documentation/get-started/gdk-300/303-ensuring-quality.html
Moreover, please apply the delivery checklist to your project. You can find it here: https://doc.gdk.fdj-gs.com/documentation/get-started/gdk-300/3032-delivery-checklist.html

## Versioning and delivering

Versioning and delivering is ensured by the CI/CD.

The CD will automatically update the version of the games. Build and pack the deliveries, upload then on nexus, generate a pdf release note and upload it also to nexus.

### Versioning

Defaultly, versioning is ensured by the CI/CD. In most cases, **do not** manually modify versions in `package.json`.

CI/CD will automatically compare the current state of the game with previous deliveries and update versions consequently.
If the game was never published, it will be delivered with the current version in the `package.json`.
If the game was updated, it will perform a **patch** bump.

When you want to perform a minor or a major bump, you **MUST** update the version yourself.
If the provider or the technical name were updated, the CI will not be able to find previsouly published deliveries. In this case you **MUST** update the version yourself.

### Changelog and limitations

Changelog and limitations will be added to the delivery note generated by the CD.

Changelog will be generated from the commits messages. But you can override it by providing a `changelog-override.md` file at the root of the repository. Content of this file will then be used as changelog. Remember to delete or update this file for your next delivery.

In the same way, you can add limitations to the delivery note by providing a `limitations.md` file at the root of the repository. Once again content of this file will be used as limitations and you have to remove or update it for your next delivery.

### Partial delivery

For multiple games repository (gdk 2), you might sometimes only want to deliver some of the games. The `ci.conf.json` can help you to do that. See the example:

```json title="ci.conf.json"
{
	"ignore": false, // if set to true, CD will be disabled for the whole repository
	// [...]
	"gameSpecifications": {
		"nameofthegame": { // name of the game as in the package.json "games" field.
			"ignore": true // CD will be disabled only for this game
		}
	}
}
```

Note that the `gameSpecifications` key is optionnal in the `ci.conf.json` file.

### Delivering

#### For internal developers

When you work on a feature/refact/bugfix.... branch, the CI will be triggered only when you open a merge request.

When you have merged your modifications into `dev`, the CI will be triggered with and extra manual and optionnal step: `predeliver`.
You have to manually start this job through the gitlab interface.
This job will give you an overview of the release note that will be generated during the delivery. This report will be added as a comment on the merge request if it exists, or by mail to the recipients referenced in the `notification.predeliveryMailRecipients` of the `ci.conf.json` file.
We recommand you to **ALWAYS** check the predeliver report before merging into `master`.

When you have merged `dev` into `master`, you will once again have to manually start the `predeliver` report. You will receive it by mail. If everything seems good to you, you will have to manually start the delivery job through the gitlab interface. Once the delivery is done, recipients referenced in the `notification.mailRecipients` of the `ci.conf.json` file will be notified of the delivery and given a link to the release note.

**Do not change the default merge message** when merging from `dev` to `master`. CD will only by triggered if the commit message starts by "Merge branch".

```json title="ci.conf.json"
{
	"ignore": false,
	"notification": {
		"predeliveryMailRecipients": ["dgf-team@fdj-gs.com"], // target of predelivery reports
		"mailRecipients": ["dgf-team@fdj-gs.com"] // target of delivery notes
	}
}
```

#### For external studio developers

Processes for external developers is not yet definitively fixed.
We currently forbid the usage of our gitlab runners to external developers, so processes on `master` and `dev` branches will be performed by a FGS referent.
Work on a branch, and when you want to deliver, create a merge request into `dev` and informs the FGS referent. He will perform the merge and start the CI. If everything is good, he will then merge into `master` and so trigger the delivery.
