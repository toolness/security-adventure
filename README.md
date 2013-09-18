[![Build Status](https://travis-ci.org/toolness/security-adventure.png)](https://travis-ci.org/toolness/security-adventure)

There is not much here yet.

In the future, this will be a [workshopper][] workshop like
[stream-adventure][] that teaches people how to write secure code for the Web.

Currently this project consists of one file, `app.js`, which is a full
web application in about 150 lines of code that allows users to create
password-protected accounts and store private plaintext notes in the cloud.
The code was written to require only the skills learned in
[learnyounode][] and [levelmeup][] to fully understand; leveldb
and [cookie][] are the only dependencies outside of node core.

`app.js` intentionally contains a number of [OWASP][]-defined security
vulnerabilities, such as:

* [Cross-Site Request Forgery][csrf] on all forms
* [Reflected Cross Site Scripting][reflected] on the 404 page
* [Sensitive Data Exposure][sde] for password storage
* [Regular Expression Denial of Service][redos] for username validation
* [Insecure Direct Object References][idor] /
  [Broken Authentication and Session Management][brokenauth] for session keys

The idea is for learners to first exploit these vulnerabilities, so they
understand how they work, and then to modify the code to implement
defenses against them.

When appropriate, workshop problems will be "standalone", i.e. they may
involve writing brand-new code rather than changing something in `app.js`.

Ideally, the tutorial will also teach users about more recent innovations in 
browser security, such as [Content Security Policy][csp] and
[HTTP Strict Transport Security][hsts].

By the end of the tutorial, users will have familiarized themselves with a
variety of types of attacks. The will also have familiarized themselves with
the OWASP website and will be equipped to independently learn about security
in the future. They will also be encouraged to read Michal Zalewski's
[The Tangled Web][tangled] for further education.

  [workshopper]: https://github.com/rvagg/workshopper
  [stream-adventure]: https://github.com/substack/stream-adventure
  [learnyounode]: https://github.com/rvagg/learnyounode
  [levelmeup]: https://github.com/rvagg/levelmeup
  [OWASP]: https://www.owasp.org/
  [csrf]: https://www.owasp.org/index.php/Cross-Site_Request_Forgery_%28CSRF%29
  [reflected]: https://www.owasp.org/index.php/Testing_for_Reflected_Cross_site_scripting_%28OWASP-DV-001%29
  [sde]: https://www.owasp.org/index.php/Top_10_2013-A6-Sensitive_Data_Exposure
  [idor]: https://www.owasp.org/index.php/Top_10_2013-A4-Insecure_Direct_Object_References
  [brokenauth]: https://www.owasp.org/index.php/Top_10_2013-A2-Broken_Authentication_and_Session_Management
  [cookie]: https://github.com/shtylman/node-cookie
  [csp]: https://developer.mozilla.org/en-US/docs/Security/CSP/Introducing_Content_Security_Policy
  [hsts]: https://developer.mozilla.org/en-US/docs/Security/HTTP_Strict_Transport_Security
  [tangled]: http://lcamtuf.coredump.cx/tangled/
  [redos]: https://www.owasp.org/index.php/Regular_expression_Denial_of_Service_-_ReDoS
