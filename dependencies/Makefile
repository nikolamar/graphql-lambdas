build_layer_lambda:
	echo "Build layer lambda"
	zsh -c 'npx esbuild ./utils/**/*.ts --outdir=../.aws-sam/build/Dependencies/utils'
	zsh -c 'npx esbuild ./configs/**/*.ts --outdir=../.aws-sam/build/Dependencies/configs'
	cd nodejs && npm ci
	cp -r nodejs ../.aws-sam/build/Dependencies/nodejs