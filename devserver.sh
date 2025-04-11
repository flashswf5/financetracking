#!/bin/sh
source .venv/bin/activate
python -m flask --app main run --debug -p ${PORT:-8080} 