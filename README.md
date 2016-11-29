# Node Natural - Remote Web Desktop for embed systems #

*Note: This program is in development, some features can not be implemented*

Node Natural (for differenciating with *CNatural*, the version written in C)
is a remote web desktop for embed systems written using JavaScript and NodeJS.

It's API provides you a simple way for design remote control apps, you can
have a secure, bidirectional comunication with the server using
[socket.io][socketio] and authentication with JSON tokens. Nothing in the
system uses `eval` or the DOM `innerHTML`-like functions, it runs using
[CSP][csp] (Content Security Policy) and multiples users can use the system
at the same time.

## How It Works ##

### Start ###

The server needs to run as a superuser, but the connected users will not have
any of the permissions of the server because the server handles each user
in base of it system permissions.

```
sudo npm start
# or
su root -c "npm start"
```

### Security ###

When a user tries to connect, the server reads the file `/etc/passwd` and
`/etc/shadow` (without decrypt them) and if the user exists **and** the
password matches, generates a unique authentication token.

The token have the form:

```
SHA256.Crypt(iiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiissssseeeeettttttttttttttt)
```

Where:

* `i` is a generated user ID.
* `s` and `e` are random bytes.
* `t` is a timestamp.

One copy of the token it's saved on the server and one copy is sended to
the client. At each request, the client needs to send the token via
`socket.io`: if the two tokens matches: the user can made the request.

All of this work it's realized **on the server**, the client have a pseudocode
like:

```
global token = ""

function receive_token(socket)
{
	socket.on("token", function(tk)
	{
		token = tk;
	});
}

function made_request(socket, request, arguments)
{
	socket.emit("client", {
		"request": request,
		"params": arguments,
		"token": global token
	});
}
```

### FrontEnd ###

The frontend uses [Generation][generation].

### HTTPS ###

The server not have HTTPS activated by default, but you can enable it
with the NodeJS `HTTPS` builtin library.

## Contributing ##

Natural requires new APIs, applications and some other features, if you are
interesed in contributing with Natural, add your feature (or correct something),
made a pull request and add your name in the contributors section of this
file.

## Author and contributors ##

* Alejandro Linarez Rangel @alinarezrangel

*Add your name here with after doing a contribution*

## License ##

Node Natural (or Natural, for short) is licensed under the Apache 2.0
license. See the [LICENSE][license] file.

[socketio]: http://socket.io/
[generation]: https://github.com/alinarezrangel/generation
[license]: ./LICENSE
[csp]: https://content-security-policy.com/
