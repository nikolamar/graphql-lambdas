build-ConfigsLayer:
	echo "Build configs layer"
	zsh -c 'npx esbuild ./configs/**/*.ts \
		--target=node16 \
		--platform=node \
		--minify=false \
		--format=cjs \
		--outdir=$(ARTIFACTS_DIR)/configs \
'