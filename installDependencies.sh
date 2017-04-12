#!/usr/bin/env bash

command -v apt-get >/dev/null 2>&1 || { echo >&2 "installDependencies script can only be run on ubuntu, please install dependencies manually. Current platform is not ubuntu.  Aborting."; exit 1; }
command -v tesseract >/dev/null 2>&1 || { sudo apt-get install tesseract-ocr }
command -v imagemagick >/dev/null 2>&1 || { sudo apt-get install imagemagick }
