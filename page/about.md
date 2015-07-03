<script>{
	"title": "About jQuery UI"
}</script>

jQuery UI is a curated set of user interface interactions, effects, widgets, and themes built on top of the jQuery JavaScript Library. Whether you're building highly interactive web applications or you just need to add a date picker to a form control, jQuery UI is the perfect choice.

## Vision and Goals

### Collaborative design process

The process for designing and planning the future of the jQuery UI library should be open, transparent and in the hands of the community. We welcome input from anyone interested in engaging with the team, from hard-core developers to visual and interaction designers, accessibility experts, product managers, business people, end users and more.

### Flexible styling and themes

Widgets should provide hooks to enable developers to customize both behavioral and presentational aspects. Transition animations should be optional and customizable. Class names used on internal elements should be meaningful to jQuery UI users and enable styling either through [ThemeRoller](http://jqueryui.com/themeroller/) or hand-written CSS via the [jQuery UI CSS Framework](http://learn.jquery.com/jquery-ui/theming/). As much as possible, style attributes should be separated into the plugin's CSS, not within the scripts in order to make customization simple and clear. Widgets styles should be coded with proportional (em-based or % based) sizing and should re-flow horizontally to fill the space provided.

### Elegant visual and interaction design

All widgets should be designed for simplicity, ease of use and aesthetics. We aim to synthesize best practice examples from mobile and desktop OS, web applications and a bit of common sense to create a robust and flexible set of UI widgets that is visually coherent and consistent in behavior. Features should be pared down to focus on what is practical and commonly needed with a system for extending features through customization.

### Elegant API

The jQuery UI API is designed to be as simple and intuitive as the jQuery API. You find elements using a query selector, then call a succinct method on the resultant set. There are suitable defaults to cover the most common use cases, so quite often it's not necessary to specify any non-default options. All options are optional.

### Progressive enhancement

Since we're developing non-native HTML controls, widgets should be built in such a way that users on browsers and devices that are unable to support JavaScript can still interact with the website or application. Most of the current set of UI widgets follow the best practice of progressive enhancement and we're working to extend that pattern to widgets that don't. In most cases, advanced components can be generated from HTML primitives (i.e. slider from select menu, radio set, or text input), and as the UI library paired with the most popular JavaScript library in the world, we should lead by example in this area. Any UI widget that sits within the flow of a form should be able to store data using semantic HTML elements so the form can be submitted or serialized normally. jQuery UI components should follow the unobtrusive practices put forth by jQuery itself, and should attempt to be forward-looking in its attempts to normalize across browsers and devices (test for features/bugs, not browser sniffing).

### Deep accessibility support

Widgets should also be accessible to JavaScript-capable users who have disabilities such as blindness or deafness (should we ever venture into the arena of audio/video integration, for instance). We attempt to make components accessible through the use of semantic HTML elements within components and following the guidelines specified in the WAI-ARIA spec. Any image-based actions within widgets should provide text equivalents (close icons, expand/collapse icons, etc. should have title attributes at the least).

### Internationalization and localization

Given the global audience for jQuery UI, we should embrace the ability to make our plugins work in a variety of languages and cultures.  By abstracting language away from the core plugin code and providing options for supporting cultural differences (right to left reading orientation, date and currency formats, iconography, etc.) we can build in the flexibility needed for a global community.

## jQuery UI Team

There's a lot of work that goes into making jQuery UI the most successful UI library for the Web. Between API design, visual design, implementation, ticket triage, bug fixing, developer relations, infrastructure, and everything else, most of the work is done by volunteers. We'd like to recognize the most prominent contributors below, for a full list of all contributors, see the [authors list](https://github.com/jquery/jquery-ui/blob/master/AUTHORS.txt).

### [Scott González](http://nemikor.com/) — Project Lead

Scott González is a web developer living in York, PA. As project lead, he puts a lot of effort into keeping jQuery UI efficient, consistent, and accessible, as well as adjusting the roadmap to meet the ever-changing needs of the community. Scott also works with browser vendors and standards bodies to make the Web a better place for everyone, not just jQuery users.

### [Jörn Zaefferer](http://bassistance.de/) — Development Lead

Jörn is a freelance web developer, consultant and trainer, residing in Cologne, Germany. Jörn evolved jQuery’s testsuite into QUnit, a JavaScript unit testing framework, and maintains it. He created and maintains a number of popular plugins. As a jQuery UI development lead, he focuses on the development of new plugins, widgets and utilities.

### [Felix Nagel](http://www.felixnagel.com/)

Felix is a [freelance web developer](http://www.felixnagel.com/portfolio/) specializing in TYPO3 CMS and Symfony2 development. He is currently living in Dresden, Germany. Felix has built the [Selectmenu](http://jqueryui.com/selectmenu/) widget and is currently working on the [Datepicker](http://jqueryui.com/datepicker/) widget.

### [Mike Sherov](http://mike.sherov.com)

Mike is a Senior Software Engineer at [Behance](http://blog.behance.net/dev), from Plainview, New York. Mike is involved in bug fixing, testing, and code quality efforts across the jquery suite of projects. He focuses his efforts around the CSS/JS interactions and interacts with standards bodies and browser vendors to move the web forward.

### [Rafael Xavier de Souza](http://rafael.xavier.blog.br/)

Xavier rewrote Globalize on top of CLDR and is now its project lead. He also rewrote and maintains jQuery UI's download builder and ThemeRoller. He has a B.S. in Computer Science from University of Sao Paulo, Brazil. He was a Software Engineer at IBM, where he lead the brazilian team of Q&A and Performance at Linux Technology Center.

### [TJ VanToll](http://tjvantoll.com)

TJ VanToll is a web developer, speaker, and writer living in Lansing, MI and working as a developer advocate for [Telerik](http://www.telerik.com/). He works on all facets of jQuery UI including triage, documentation, bug fixes, and is currently working on the rewrite of [the datepicker widget](http://jqueryui.com/datepicker/).

## Contributors (Past & Present)

### Aaron Eisenberger
### [Adam J. Sontag](http://www.adamjsontag.com)
### [Alex Dovenmuehle](https://github.com/Adovenmuehle)
### [Ca-Phun Ung](http://www.yelotofu.com/)
### [Chi Cheng](http://chicheng.me/)
### [Cody Lindley](http://www.codylindley.com/)
### Colin Clark
### [Corey Frang](http://gnarf.net/)
### [Dan Heberden](https://twitter.com/danheberden)
### David Bolter
### [David Petersen](http://blog.petersendidit.com/)
### Eduardo Lundgren
### Hans Hillen
### [Keith Wood](http://keith-wood.name/)
### [Klaus Hartl](http://stilbuero.de/)
### [Kris Borchers](http://krisborchers.com/)
### [Maggie Costello Wachs](http://www.filamentgroup.com/)
### [Marc Grabanski](http://marcgrabanski.com/)
### Michelle D'Souza
### [Patty Toland](http://www.filamentgroup.com/)
### [Paul Bakaus](http://paulbakaus.com/)
### [Paul Irish](http://paulirish.com/)
### [Ralph Whitbeck](http://ralphwhitbeck.com/)
### Rich Caloggero
### [Richard D. Worth](http://rdworth.org/)
### [Scott Jehl](http://www.filamentgroup.com/)
### [Thomas Klose](http://www.thomasklose.com/)
### [Todd Parker](http://www.filamentgroup.com/)
