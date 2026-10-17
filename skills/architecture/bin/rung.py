#!/usr/bin/env python3
# SPDX-FileCopyrightText: 2026 Dermot O'Brien
# SPDX-License-Identifier: Apache-2.0
"""The former name of bin/stage.py, kept so existing commands and scripts still run."""
import os
import sys

sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "src"))

from ladder.cli import main  # noqa: E402

if __name__ == "__main__":
    sys.exit(main())
