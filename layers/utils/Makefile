build-UtilsLayer:
	echo "Build utils layer"
	find utils -name '*.ts' -exec npx esbuild {} --target=node16 --platform=node --minify=false --format=cjs --outdir=$(ARTIFACTS_DIR)/utils \;