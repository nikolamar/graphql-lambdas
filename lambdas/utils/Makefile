build-UtilsLayer:
	echo "Build utils layer"
	zsh -c 'npx esbuild ./utils/**/*.ts \
		--target=node16 \
		--platform=node \
		--minify=false \
		--format=cjs \
		--outdir=$(ARTIFACTS_DIR)/utils \
'