<script>{
    "title": "Browser Support"
}</script>

## Current Active Support

jQuery UI 1.11.x supports the following browsers:

* Chrome: (Current - 1) or Current
* Firefox: (Current - 1) or Current
* Safari: 5.1+
* Opera: 12.1x, (Current - 1) or Current
* IE 8+

Any problem with jQuery UI in the above browsers should be reported as a bug in jQuery UI.

*(Current - 1) or Current* denotes that we support the current stable version of the browser and the version that preceded it. For example, if the current version of a browser is 24.x, we support the 24.x and 23.x versions.

*12.1x, (Current - 1) or Current* denotes that we support Opera 12.1x as well as the 2 latest versions of Opera. For example, if the current Opera version is 20.x, we support Opera 12.1x, 19.x and 20.x but not Opera 15.x through 18.x.

----

## Unsupported Browsers

While jQuery UI *might* run without major issues in older browser versions, we do not actively test jQuery UI in them and generally do not fix bugs that may appear in them.

Similarly, jQuery UI does not fix bugs in pre-release versions of browsers, such as beta or dev releases. If you find a bug with jQuery UI in a pre-release of a browser, you should report the bug to the browser vendor.

----

## jQuery Core Browser Support

jQuery UI supports several versions of jQuery Core. The version of jQuery being used may further limit which browsers jQuery UI will run in. See [jQuery's browser support](https://jquery.com/browser-support/) for a list of supported browsers by version.

----

## Assistive Technology

jQuery UI officially tries to support the most popular screen reader and browser combinations. We aim for full accessibility with the following combinations:

* Current NVDA with current Firefox
* Current VoiceOver with current Safari
* Current JAWS with current IE

Unfortunately limitations and bugs in some of these assistive technologies make it hard to support all of them at the same time. We do our best to support the widest range while advocating for improved accessibility standards. See the <a href="http://webaim.org/projects/screenreadersurvey5/#primary">screen reader survey</a> for usage statistics.

### Older/Other Assistive Technology

We accept patches for older/other AT if:

* The code is maintainable/not super hacky.
* The changes are relatively small.
* The changes don't break or harm accessibility for conforming AT.

We value interactions over technical implementations. Diverging from the roles and attributes in the ARIA authoring practices is acceptable if the interactions remain as expected and overall accessibility is improved.
