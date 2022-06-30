build-DependenciesLayer:
	echo "Build layer lambda"
	zsh -c 'npx esbuild ./utils/**/*.ts --target=es2020 --format=cjs --outdir=$(ARTIFACTS_DIR)/utils'
	zsh -c 'npx esbuild ./configs/**/*.ts --target=es2020 --format=cjs --outdir=$(ARTIFACTS_DIR)/configs'
	cd nodejs && npm ci
	cp -r nodejs $(ARTIFACTS_DIR)/nodejs