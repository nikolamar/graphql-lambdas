build-ConfigsLayer:
	echo "Build configs layer"
	zsh -c 'npx esbuild ./configs/**/*.ts --target=es2020 --format=cjs --outdir=$(ARTIFACTS_DIR)/configs'