<script>{
	"title": "Browser Support"
}</script>

## Current Active Support

jQuery UI 1.14.x supports the following browsers:

* Chrome: Current
* Firefox: Current
* Safari: Current
* Edge: Current

Any problem with jQuery UI in the above browsers should be reported as a bug in jQuery UI.

*Current* denotes that we support the current stable version of the browser.

jQuery UI 1.13.x was the last version line to support IE 11 & Edge Legacy 18. 

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

* Current NVDA with current Chrome or Firefox
* Current VoiceOver with current Safari
* Current JAWS with current Chrome or Edge

However, due to [limited resources](https://blog.jqueryui.com/2021/10/jquery-maintainers-update-and-transition-jquery-ui-as-part-of-overall-modernization-efforts/), we rely on the community to report issues in the configurations above.

Unfortunately limitations and bugs in some of these assistive technologies make it hard to support all of them at the same time. We do our best to support the widest range while advocating for improved accessibility standards. See the [Screen Reader User Survey #10](https://webaim.org/projects/screenreadersurvey10/#browsercombos) for usage statistics.

### Older/Other Assistive Technology

We accept patches for older/other AT if:

* The code is maintainable/not super hacky.
* The changes are relatively small.
* The changes don't break or harm accessibility for conforming AT.

We value interactions over technical implementations. Diverging from the roles and attributes in the ARIA authoring practices is acceptable if the interactions remain as expected and overall accessibility is improved.
