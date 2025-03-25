.PHONY: commit

commit:
ifndef message
	$(error ❌ message is not set — gunakan: make commit message="Pesan commit")
endif
	git add .
	git commit -m "$(message)"
	git push origin main