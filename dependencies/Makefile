build-DependenciesLayer:
	echo "Build layer lambda"
	zsh -c 'npx esbuild ./utils/**/*.ts --outdir=$(ARTIFACTS_DIR)/utils'
	zsh -c 'npx esbuild ./configs/**/*.ts --outdir=$(ARTIFACTS_DIR)/configs'
	cd nodejs && npm install --omit=dev
	npx node-prune nodejs/node_modules
	cp -r nodejs $(ARTIFACTS_DIR)/nodejs