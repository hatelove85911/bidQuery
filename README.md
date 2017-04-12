# bidQuery
bidQuery

# Dependency
imagemagick
tesseract-ocr
node, npm

# install
npm install -g https://github.com/hatelove85911/bidQuery.git
It will create a binary command: bidq

# usage
bidq command take two arguments:
* bidder's id
* bid no

you can query one bidder's information like this:  
`bidq <bidder id> <bidno>`  
after some seconds, the bid information will be print out to console


# mass query
in most case, you want to use this tool to query many bidder's information.
organize the bidders information into a 2 columns file, first column
is id, second column is bid number, e.g.

```
620104197709041111 53881111
310225199402122222 53822222
130206198303073333 53833333
```

run following commands: 
cat <bidinfofile> | xargs -n2 bidq
