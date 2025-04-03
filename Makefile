.PHONY: commit
commit:
ifndef message
	$(error ❌ message is not set — gunakan: make commit branch="nama-branch" message="Pesan commit")
endif
ifndef branch
	$(error ❌ branch is not set — gunakan: make commit branch="nama-branch" message="Pesan commit")
endif
	git add .
	git commit -m "$(message)"
	git push origin $(branch)