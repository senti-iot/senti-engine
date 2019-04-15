#!/bin/bash
# chmod 700 api-restart.sh

if [[ "$1" == "master" ]]; then 
	npm install --prefix /srv/nodejs/senti/services/gateway/production
	systemctl restart senti-gateway.service
	# Senti Slack Workspace
	curl -X POST -H 'Content-type: application/json' --data '{"text":"Senti Gateway MASTER updated and restarted!"}' https://hooks.slack.com/services/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
	echo
	exit 0
fi

if [[ "$1" == "dev" ]]; then 
	npm install --prefix /srv/nodejs/senti/services/gateway/development
	systemctl restart senti-gateway-dev.service
	# Senti Slack Workspace
	curl -X POST -H 'Content-type: application/json' --data '{"text":"Senti Gateway DEV updated and restarted!"}' https://hooks.slack.com/services/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
	echo
	exit 0
fi

exit 0


