[![Build Status](https://travis-ci.org/toolness/security-adventure.png)](https://travis-ci.org/toolness/security-adventure)

This repository contains an exciting quest to learn about Web security by
learning about vulnerabilities, exploiting them, and then crafting code to
protect against them.

## Prerequisites

First, make sure you have the skills taught in [learnyounode][] and
[levelmeup][].

Also, make sure [phantomjs][] is installed and on your path (as well as
node and npm, of course).

You may want to familiarize yourself with the [cookie][] module too.

## Start The Adventure!

Right now things are a bit messy, but you can start the adventure like so:

```
git clone https://github.com/toolness/security-adventure.git
cd security-adventure
npm install
cp app-vulnerable.js app.js
```

`app.js` is a full web application in about 150 lines of code that
allows users to create password-protected accounts and store private
plaintext notes in the cloud.

Run `node app.js` and then browse to http://localhost:3000 to familiarize
yourself with the behavior of the application. Then read the source of
`app.js` to get a basic idea of how everything works.

`app.js` contains lots of vulnerabilities, and your quest is to learn about
and fix all of them!

### Vulnerability: Regular Expression Denial of Service

The regular expression used to validate usernames has a 
[Regular Expression Denial of Service][redos] vulnerability in it.

Read about this vulnerability, and then try exploiting it manually by
visiting the app in your browser and entering an invalid username that
will cause the app to hang.

Then fix `app.js`. When you're done, run `bin/verify.js redos` to verify
that your solution works!

### Vulnerability: Reflected Cross Site Scripting

The home page of the app accepts a `msg` querystring argument containing
a status message to display. This is used, for instance, when users fail
to authenticate properly and the server needs to provide feedback.

This isn't exactly a best practice for various reasons, but most importantly,
it contains a [Reflected Cross Site Scripting][reflected] vulnerability!

Read about the vulnerability, and then try crafting a URL that, when visited,
causes the user's browser to display an alert dialog that contains the
user's session cookie (accessible through `document.cookie`).

#### Stopping Cookie Theft

Cookie theft is a particularly big danger because it allows attackers to
do anything on a user's behalf, whenever they want. So first, mitigate
the effects of XSS vulnerabilities by modifying `app.js` to issue
[HttpOnly][] cookies. See the [cookie][] module documentation for
information on how to do this.

When you're done, run `bin/verify.js xss-cookie-theft` to verify that
your solution works.

#### Stopping XSS

It's nice that the damage that can be done via the XSS attack is somewhat
mitigated, but it's way better to prevent the attack entirely! This can be
done by properly escaping the untrusted input coming in from the `msg`
querystring argument.

The [OWASP XSS Prevention Cheat Sheet][xss-cheat-sheet] is indispensable
here. Check it out and use a reliable function like underscore's
[_.escape][] to escape the `msg` argument before inserting it into your
HTML. (Note that if you decide to use underscore, you'll want to install it
first using `npm install underscore`.)

When you're done, run `bin/verify.js reflected-xss` to verify that your
solution works.

### Hooray!

You've completed all the challenges so far. You can verify that your `app.js`
protects against all the problems you've solved, and still retains its
basic functionality, by running `bin/verify.js all`.

If you want to learn more about Web security, you should read Michal Zalewski's
[The Tangled Web][tangled]. It is hilarious and very educational.

## Goals and Future Plans

In the future, this will be a [workshopper][] workshop like
[stream-adventure][] that teaches people how to write secure code for the Web.

`app.js` intentionally contains a number of [OWASP][]-defined security
vulnerabilities that aren't currently part of the quest, such as:

* [Cross-Site Request Forgery][csrf] on all forms
* [Sensitive Data Exposure][sde] for password storage
* [Insecure Direct Object References][idor] /
  [Broken Authentication and Session Management][brokenauth] for session keys

Learners should first exploit these vulnerabilities, so they
understand how they work, and then to modify the code to implement
defenses against them.

Ideally, the tutorial will also teach users about more recent innovations in 
browser security, such as [Content Security Policy][csp] and
[HTTP Strict Transport Security][hsts]. It should also teach developers how to
use security tools like the [Zed Attack Proxy][zap] to easily detect for
vulnerabilities in their own applications.

By the end of the tutorial, users will have familiarized themselves with a
variety of types of attacks. The will also have familiarized themselves with
the OWASP website and will be equipped to independently learn about security
in the future.

  [xss-cheat-sheet]: https://www.owasp.org/index.php/XSS_%28Cross_Site_Scripting%29_Prevention_Cheat_Sheet
  [_.escape]: http://underscorejs.org/#escape
  [zap]: https://www.owasp.org/index.php/OWASP_Zed_Attack_Proxy_Project
  [HttpOnly]: https://www.owasp.org/index.php/HttpOnly
  [phantomjs]: http://phantomjs.org/
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
