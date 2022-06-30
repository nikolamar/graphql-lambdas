build-UtilsLayer:
	echo "Build utils layer"
	zsh -c 'npx esbuild ./utils/**/*.ts --target=es2020 --format=cjs --outdir=$(ARTIFACTS_DIR)/utils'