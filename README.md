# URL Shortener Microservice

User Story: I can pass a URL as a parameter and I will receive a shortened URL in the JSON response.

User Story: If I pass an invalid URL that doesn't follow the valid http://www.example.com format, the JSON response will contain an error instead.

### Example creation usage:

```
https://jungle-list.glitch.me/new/http://foo.com:80
```

### Example creation output:

```
{"url":"http://foo.bar","shortURL":"https://jungle-list.glitch.me/OaOiH"}
```

### Usage:

```
https://little-url.herokuapp.com/OaOiH
```

### Will redirect to:

```
http://foo.bar
```