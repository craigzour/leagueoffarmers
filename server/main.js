#!/usr/bin/env node
// -*- coding: utf-8 -*-
"use strict"

var Server = require('./src/server.js')

function main() {
  var s = new Server(8000);
  s.runServer();
}

main();
