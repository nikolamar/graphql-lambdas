build-ConfigsLayer:
	echo "Build configs layer"
	find configs -name '*.ts' -exec npx esbuild {} --target=node16 --platform=node --minify=false --format=cjs --outdir=$(ARTIFACTS_DIR)/configs \;