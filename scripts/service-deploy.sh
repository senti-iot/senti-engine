#!/bin/bash

if [[ "$1" == "master" ]]; then 
	echo
	echo Deploying Senti Engine $1 ... 
	rsync -r --quiet $2/ deploy@rey.webhouse.net:/srv/nodejs/senti/services/engine/production
	echo
	echo Restarting Senti Engine service: $1 ... 
	ssh deploy@rey.webhouse.net 'sudo /srv/nodejs/senti/services/engine/production/scripts/service-restart.sh master'
	echo
	echo Deployment to Senti Engine $1 and restart done!
	exit 0
fi 

if [[ "$1" == "dev" ]]; then 
	echo
	echo Deploying Senti Engine $1 ... 
	rsync -r --quiet $2/ deploy@rey.webhouse.net:/srv/nodejs/senti/services/engine/development
	echo
	echo Restarting Senti Engine service: $1 ... 
	ssh deploy@rey.webhouse.net 'sudo /srv/nodejs/senti/services/engine/development/scripts/service-restart.sh dev'
	echo
	echo Deployment to Senti Engine $1 and restart done!
	exit 0
fi