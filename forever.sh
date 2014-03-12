#!/bin/bash

export FOSSA_SIM_PID=$HOME/.forever/fossa.pid

if [ -f "$FOSSA_SIM_PID" ]; then
  forever stop app.js
fi

npm install
npm test

forever start --append --pidFile $FOSSA_SIM_PID --minUptime 5000 --spinSleepTime 5000 app.js
