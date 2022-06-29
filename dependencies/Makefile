build-DependenciesLayers:
	echo "Build layer lambda"
	zsh -c 'npx esbuild ./utils/**/*.ts --outdir=../.aws-sam/build/Dependencies/utils'
	zsh -c 'npx esbuild ./configs/**/*.ts --outdir=../.aws-sam/build/Dependencies/configs'
	cd nodejs && npm install --omit=dev
	npx node-prune nodejs/node_modules
	cp -r nodejs ../.aws-sam/build/Dependencies/nodejs