-- Update the G1 Origin Lattice with correct diamond-shaped anchor positions
-- Based on the notebook drawings showing the true letter placements

UPDATE public.lattices
SET 
  anchors_json = '{
    " ": [0.9, 0.9],
    "A": [0.15, 0.1],
    "B": [0.1, 0.35],
    "C": [0.1, 0.9],
    "D": [0.35, 0.35],
    "E": [0.32, 0.5],
    "F": [0.32, 0.65],
    "G": [0.65, 0.1],
    "H": [0.85, 0.5],
    "I": [0.65, 0.9],
    "J": [0.22, 0.22],
    "K": [0.15, 0.5],
    "L": [0.22, 0.78],
    "M": [0.5, 0.22],
    "N": [0.5, 0.5],
    "O": [0.5, 0.78],
    "P": [0.78, 0.22],
    "Q": [0.85, 0.35],
    "R": [0.78, 0.78],
    "S": [0.38, 0.1],
    "T": [0.1, 0.65],
    "U": [0.35, 0.9],
    "V": [0.58, 0.35],
    "W": [0.68, 0.5],
    "X": [0.58, 0.65],
    "Y": [0.85, 0.1],
    "Z": [0.9, 0.65]
  }'::jsonb,
  rules_json = '{
    "enableTick": true,
    "tickLengthFactor": 0.08,
    "insideBoundaryPreference": true,
    "nodeSpacing": 0.15
  }'::jsonb,
  updated_at = now()
WHERE lattice_key = 'g1-origin';