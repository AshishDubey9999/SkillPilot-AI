export type DSADifficulty = 'Easy' | 'Medium' | 'Hard'

export type DSAProblem = {
  id: string
  patternId: string
  title: string
  difficulty: DSADifficulty
  links: string[]
}

export type DSAPattern = {
  id: string
  name: string
  description: string
  problems: DSAProblem[]
}

const p = (patternId: string, id: string, title: string, difficulty: DSADifficulty, ...links: string[]): DSAProblem => ({ id, patternId, title, difficulty, links })

export const dsaPatterns: DSAPattern[] = [
  {
    id: 'two-pointers', name: 'Two Pointers', description: 'Use coordinated pointers to solve array and string problems efficiently.',
    problems: [
      p('two-pointers','two-sum-ii','Pair with Target Sum','Easy','https://leetcode.com/problems/two-sum-ii-input-array-is-sorted/description/'),
      p('two-pointers','rearrange-01','Rearrange 0 and 1','Easy','https://www.geeksforgeeks.org/problems/segregate-0s-and-1s5106/1'),
      p('two-pointers','remove-duplicates-array','Remove Duplicates','Easy','https://leetcode.com/problems/remove-duplicates-from-sorted-array/description/'),
      p('two-pointers','squares-sorted-array','Squaring a Sorted Array','Easy','https://leetcode.com/problems/squares-of-a-sorted-array/'),
      p('two-pointers','3sum','Triplet Sum to Zero','Medium','https://leetcode.com/problems/3sum/'),
      p('two-pointers','3sum-closest','Triplet Sum Close to Target','Medium','https://leetcode.com/problems/3sum-closest/'),
      p('two-pointers','triplets-smaller-sum','Triplets with Smaller Sum','Medium','https://www.geeksforgeeks.org/problems/count-triplets-with-sum-smaller-than-x5549/1'),
      p('two-pointers','subarray-product','Subarrays with Product Less than a Target','Medium','https://leetcode.com/problems/subarray-product-less-than-k/'),
      p('two-pointers','sort-colors','Dutch National Flag Problem','Medium','https://leetcode.com/problems/sort-colors/description/'),
      p('two-pointers','4sum','Quadruple Sum to Target','Medium','https://leetcode.com/problems/4sum/'),
      p('two-pointers','backspace-string-compare','Comparing Strings containing Backspaces','Medium','https://leetcode.com/problems/backspace-string-compare/'),
      p('two-pointers','minimum-window-sort','Minimum Window Sort','Medium','https://leetcode.com/problems/shortest-unsorted-continuous-subarray/'),
    ],
  },
  {
    id: 'fast-slow', name: 'Fast & Slow Pointers', description: 'Use different pointer speeds to detect cycles and work with linked structures.',
    problems: [
      p('fast-slow','linked-list-cycle','LinkedList Cycle','Easy','https://leetcode.com/problems/linked-list-cycle/'),
      p('fast-slow','cycle-ii','Start of LinkedList Cycle','Medium','https://leetcode.com/problems/linked-list-cycle-ii/'),
      p('fast-slow','happy-number','Happy Number','Medium','https://leetcode.com/problems/happy-number/'),
      p('fast-slow','find-duplicate','Find Duplicate Number','Medium','https://leetcode.com/problems/find-the-duplicate-number/description/'),
      p('fast-slow','middle-linked-list','Middle of the LinkedList','Easy','https://leetcode.com/problems/middle-of-the-linked-list/'),
      p('fast-slow','palindrome-linked-list','Palindrome LinkedList','Medium','https://leetcode.com/problems/palindrome-linked-list/'),
      p('fast-slow','reorder-list','Rearrange a LinkedList','Medium','https://leetcode.com/problems/reorder-list/'),
      p('fast-slow','circular-array-loop','Cycle in a Circular Array','Hard','https://leetcode.com/problems/circular-array-loop/'),
    ],
  },
  {
    id: 'sliding-window', name: 'Sliding Window', description: 'Maintain a moving window for contiguous subarray and substring problems.',
    problems: [
      p('sliding-window','max-sum-k','Maximum Sum Subarray of Size K','Easy','https://www.geeksforgeeks.org/problems/max-sum-subarray-of-size-k5313/1'),
      p('sliding-window','smallest-subarray-sum','Smallest Subarray with a given sum','Easy','https://leetcode.com/problems/minimum-size-subarray-sum/'),
      p('sliding-window','longest-k-distinct','Longest Substring with K Distinct Characters','Medium','https://www.geeksforgeeks.org/problems/longest-k-unique-characters-substring0853/1'),
      p('sliding-window','fruits-baskets','Fruits into Baskets','Medium','https://leetcode.com/problems/fruit-into-baskets/'),
      p('sliding-window','longest-no-repeat','No-repeat Substring','Hard','https://leetcode.com/problems/longest-substring-without-repeating-characters/'),
      p('sliding-window','character-replacement','Longest Substring with Same Letters after Replacement','Hard','https://leetcode.com/problems/longest-repeating-character-replacement/'),
      p('sliding-window','max-consecutive-ones','Longest Subarray with Ones after Replacement','Hard','https://leetcode.com/problems/max-consecutive-ones-iii/'),
      p('sliding-window','permutation-string','Permutation in a String','Hard','https://leetcode.com/problems/permutation-in-string/'),
      p('sliding-window','find-anagrams','String Anagrams','Hard','https://leetcode.com/problems/find-all-anagrams-in-a-string/'),
      p('sliding-window','min-window-substring','Minimum Size Substring','Hard','https://leetcode.com/problems/minimum-window-substring/'),
    ],
  },
  {
    id: 'kadane', name: 'Kadane Pattern', description: 'Solve maximum/minimum contiguous subarray variants in linear time.',
    problems: [
      p('kadane','maximum-subarray','Maximum Subarray Sum','Easy','https://leetcode.com/problems/maximum-subarray/'),
      p('kadane','minimum-subarray','Minimum Subarray Sum','Medium','https://www.geeksforgeeks.org/problems/smallest-sum-contiguous-subarray/1'),
      p('kadane','max-product','Maximum Product Subarray','Medium','https://leetcode.com/problems/maximum-product-subarray/'),
      p('kadane','one-deletion','Maximum Subarray Sum with One Deletion','Medium','https://leetcode.com/problems/maximum-subarray-sum-with-one-deletion/description/'),
      p('kadane','absolute-sum','Maximum Absolute Sum of Any Subarray','Medium','https://leetcode.com/problems/maximum-absolute-sum-of-any-subarray/'),
      p('kadane','circular','Maximum Sum Circular Subarray','Medium','https://leetcode.com/problems/maximum-sum-circular-subarray/'),
    ],
  },
  {
    id: 'prefix-sum', name: 'Prefix Sum', description: 'Precompute cumulative information to answer range and subarray queries efficiently.',
    problems: [
      p('prefix-sum','subarray-sum-k','Subarray Sum Equals K','Easy','https://leetcode.com/problems/subarray-sum-equals-k/description/'),
      p('prefix-sum','pivot-index','Find Pivot Index','Easy','https://leetcode.com/problems/find-pivot-index/description/'),
      p('prefix-sum','sums-divisible-k','Subarray Sums Divisible By K','Medium','https://leetcode.com/problems/subarray-sums-divisible-by-k/description/'),
      p('prefix-sum','contiguous-array','Contiguous Array','Medium','https://leetcode.com/problems/contiguous-array/description/'),
      p('prefix-sum','shortest-subarray-k','Shortest Subarray With Sum at Least K','Hard','https://leetcode.com/problems/shortest-subarray-with-sum-at-least-k/description/'),
      p('prefix-sum','count-range-sum','Count Range Sum','Hard','https://leetcode.com/problems/count-of-range-sum/description/'),
    ],
  },
  {
    id: 'merge-intervals', name: 'Merge Intervals', description: 'Sort and merge overlapping ranges and scheduling intervals.',
    problems: [
      p('merge-intervals','merge','Merge Intervals','Medium','https://leetcode.com/problems/merge-intervals/description/'),
      p('merge-intervals','insert','Insert Interval','Medium','https://leetcode.com/problems/insert-interval/'),
      p('merge-intervals','intersection','Intervals Intersection','Medium','https://leetcode.com/problems/interval-list-intersections/description/'),
      p('merge-intervals','overlap','Overlapping Intervals','Easy','https://www.geeksforgeeks.org/check-if-any-two-intervals-overlap-among-a-given-set-of-intervals/'),
      p('merge-intervals','meeting-rooms','Minimum Meeting Rooms','Hard','https://www.geeksforgeeks.org/problems/attend-all-meetings-ii/1'),
      p('merge-intervals','cpu-load','Maximum CPU Load','Hard','https://www.geeksforgeeks.org/maximum-cpu-load-from-the-given-list-of-jobs/'),
      p('merge-intervals','employee-free-time','Employee Free Time','Hard','https://www.codertrain.co/employee-free-time'),
    ],
  },
  {
    id: 'linked-list-reversal', name: 'In-place Reversal of a LinkedList', description: 'Reverse linked lists and sublists without extra list storage.',
    problems: [
      p('linked-list-reversal','reverse-list','Reverse a LinkedList','Easy','https://leetcode.com/problems/reverse-linked-list/'),
      p('linked-list-reversal','reverse-sublist','Reverse a Sub-list','Medium','https://leetcode.com/problems/reverse-linked-list-ii/'),
      p('linked-list-reversal','pairs','Reverse List in Pairs','Medium','https://leetcode.com/problems/swap-nodes-in-pairs/description/'),
      p('linked-list-reversal','k-group','Reverse every K-element Sub-list','Hard','https://leetcode.com/problems/reverse-nodes-in-k-group/'),
      p('linked-list-reversal','even-groups','Reverse nodes in EVEN Length Groups','Hard','https://leetcode.com/problems/reverse-nodes-in-even-length-groups/description/'),
      p('linked-list-reversal','rotate-list','Rotate a LinkedList','Medium','https://leetcode.com/problems/rotate-list/'),
    ],
  },
  {
    id: 'stack', name: 'Stack', description: 'Use LIFO structures for matching, monotonic stack and expression problems.',
    problems: [
      p('stack','adjacent-duplicates','Remove Adjacent Duplicates','Easy','https://leetcode.com/problems/remove-all-adjacent-duplicates-in-string/description/'),
      p('stack','valid-parentheses','Balanced Parentheses','Easy','https://leetcode.com/problems/valid-parentheses/description/'),
      p('stack','reverse-string','Reverse a String','Easy','https://leetcode.com/problems/reverse-string/'),
      p('stack','next-greater-ii','Next Greater Element','Easy','https://leetcode.com/problems/next-greater-element-ii/description/'),
      p('stack','daily-temperatures','Daily Temperatures','Medium','https://leetcode.com/problems/daily-temperatures/'),
      p('stack','remove-nodes','Remove Nodes From Linked List','Medium','https://leetcode.com/problems/remove-nodes-from-linked-list/'),
      p('stack','simplify-path','Simplify Path','Medium','https://leetcode.com/problems/simplify-path/'),
      p('stack','remove-k-digits','Remove K Digits','Hard','https://leetcode.com/problems/remove-k-digits/'),
    ],
  },
  {
    id: 'hash-maps', name: 'Hash Maps', description: 'Use frequency maps and constant-time lookups for string and array problems.',
    problems: [
      p('hash-maps','first-unique','First Non-repeating Character','Easy','https://leetcode.com/problems/first-unique-character-in-a-string/'),
      p('hash-maps','balloons','Maximum Number of Balloons','Easy','https://leetcode.com/problems/maximum-number-of-balloons/'),
      p('hash-maps','longest-palindrome','Longest Palindrome','Easy','https://leetcode.com/problems/longest-palindrome/'),
      p('hash-maps','ransom-note','Ransom Note','Easy','https://leetcode.com/problems/ransom-note/'),
    ],
  },
  {
    id: 'binary-search', name: 'Binary Search', description: 'Search sorted spaces and optimize monotonic answer ranges.',
    problems: [
      p('binary-search','binary-search','Binary Search','Easy','https://leetcode.com/problems/binary-search/'),
      p('binary-search','ceil','Upper Bound / Ceiling','Easy','https://www.geeksforgeeks.org/problems/ceil-in-a-sorted-array/1'),
      p('binary-search','first-last','First and Last Position','Medium','https://leetcode.com/problems/find-first-and-last-position-of-element-in-sorted-array/'),
      p('binary-search','occurrences','Count Number of Occurrences','Easy','https://www.geeksforgeeks.org/problems/number-of-occurrence2259/1'),
      p('binary-search','infinite-array','Search in Infinite Sorted Array','Medium','https://www.geeksforgeeks.org/find-position-element-sorted-array-infinite-numbers/'),
      p('binary-search','peak-mountain','Peak Index in Mountain','Medium','https://leetcode.com/problems/peak-index-in-a-mountain-array/'),
      p('binary-search','find-peak','Find Peak Element','Medium','https://leetcode.com/problems/find-peak-element/'),
      p('binary-search','min-rotated','Find Minimum in Rotated Sorted Array','Medium','https://leetcode.com/problems/find-minimum-in-rotated-sorted-array/'),
      p('binary-search','rotations','Find Number of Rotations','Medium','https://www.geeksforgeeks.org/problems/rotation4723/1'),
      p('binary-search','search-rotated','Search in Rotated Sorted Array','Medium','https://leetcode.com/problems/search-in-rotated-sorted-array/description/'),
      p('binary-search','koko','Koko Eating Bananas','Medium','https://leetcode.com/problems/koko-eating-bananas/'),
      p('binary-search','aggressive-cows','Aggressive Cows','Medium','https://www.geeksforgeeks.org/problems/aggressive-cows/1'),
      p('binary-search','ship-packages','Capacity to Ship Packages in D Days','Medium','https://leetcode.com/problems/capacity-to-ship-packages-within-d-days/description/'),
      p('binary-search','book-allocation','Book Allocation Problem','Hard','https://www.geeksforgeeks.org/problems/allocate-minimum-number-of-pages0937/1'),
      p('binary-search','split-array','Split Array Largest Sum','Hard','https://leetcode.com/problems/split-array-largest-sum/description/'),
      p('binary-search','search-2d','Search 2D Matrix','Medium','https://leetcode.com/problems/search-a-2d-matrix/'),
      p('binary-search','search-2d-ii','Search 2D Matrix II','Hard','https://leetcode.com/problems/search-a-2d-matrix-ii/description/'),
      p('binary-search','kth-matrix','Kth Smallest in Sorted Matrix','Hard','https://leetcode.com/problems/kth-smallest-element-in-a-sorted-matrix/description/'),
      p('binary-search','median-two-sorted','Median of Two Sorted Arrays','Hard','https://leetcode.com/problems/median-of-two-sorted-arrays/'),
    ],
  },
  {
    id: 'heap', name: 'Heap', description: 'Practice top-K, scheduling and streaming problems using priority queues.',
    problems: [
      p('heap','kth-smallest','Kth Smallest','Easy','https://www.geeksforgeeks.org/problems/kth-smallest-element5635/1'),
      p('heap','kth-largest','Kth Largest','Medium','https://leetcode.com/problems/kth-largest-element-in-an-array/description/'),
      p('heap','top-k-elements','Top K Frequent Elements','Medium','https://leetcode.com/problems/top-k-frequent-elements/description/'),
      p('heap','top-k-words','Top K Frequent Words','Medium','https://leetcode.com/problems/top-k-frequent-words/description/'),
      p('heap','k-closest-points','K Closest Points to Origin','Medium','https://leetcode.com/problems/k-closest-points-to-origin/description/'),
      p('heap','k-closest-elements','Find K Closest Elements','Medium','https://leetcode.com/problems/find-k-closest-elements/description/'),
      p('heap','weakest-row','Kth Weakest Row in Matrix','Easy','https://leetcode.com/problems/the-k-weakest-rows-in-a-matrix/description/'),
      p('heap','merge-k-arrays','Merge K Sorted Arrays','Medium','https://www.geeksforgeeks.org/problems/merge-k-sorted-arrays/1'),
      p('heap','last-stone','Last Stone Weight','Easy','https://leetcode.com/problems/last-stone-weight/description/'),
      p('heap','task-scheduler','CPU Task Scheduler','Medium','https://leetcode.com/problems/task-scheduler/description/'),
      p('heap','reorganize-string','Reorganize String','Medium','https://leetcode.com/problems/reorganize-string/'),
      p('heap','refuel','Minimum Number of Refueling Stops','Hard','https://leetcode.com/problems/minimum-number-of-refueling-stops/description/'),
      p('heap','ipo','IPO','Hard','https://leetcode.com/problems/ipo/description/'),
      p('heap','course-schedule-3','Course Scheduler 3','Hard','https://leetcode.com/problems/course-schedule-iii/description/'),
      p('heap','median-stream','Find Median in Data Stream','Hard','https://leetcode.com/problems/find-median-from-data-stream/description/'),
      p('heap','sliding-median','Sliding Window Median','Hard','https://leetcode.com/problems/sliding-window-median/description/'),
    ],
  },
  {
    id: 'recursion-backtracking', name: 'Recursion & Backtracking', description: 'Build recursive thinking and explore decision trees systematically.',
    problems: [
      p('recursion-backtracking','fibonacci','Fibonacci','Easy','https://leetcode.com/problems/fibonacci-number/description/'),
      p('recursion-backtracking','palindrome-string','Check if String is Palindrome','Easy','https://www.geeksforgeeks.org/problems/palindrome-string0817/1'),
      p('recursion-backtracking','sorted-array','Check if Array is Sorted','Easy','https://www.geeksforgeeks.org/problems/check-if-an-array-is-sorted0701/1'),
      p('recursion-backtracking','sum-digits','Sum of Digits of a Number','Easy','https://www.geeksforgeeks.org/problems/sum-of-digits1742/1'),
      p('recursion-backtracking','remove-char','Remove Occurrences of a Character','Easy','https://www.geeksforgeeks.org/problems/remove-all-occurrences-of-a-character-in-a-string/1'),
      p('recursion-backtracking','generate-parentheses','Generate Parentheses','Medium','https://leetcode.com/problems/generate-parentheses/description/'),
      p('recursion-backtracking','phone-combinations','Letter Combinations of Phone Number','Medium','https://leetcode.com/problems/letter-combinations-of-a-phone-number/description/'),
      p('recursion-backtracking','permutations','Permutations','Medium','https://leetcode.com/problems/permutations/description/'),
      p('recursion-backtracking','combination-sum','Combination Sum','Medium','https://leetcode.com/problems/combination-sum/description/'),
      p('recursion-backtracking','palindrome-partition','Palindrome Partitioning','Medium','https://leetcode.com/problems/palindrome-partitioning/description/'),
    ],
  },
  {
    id: 'trees', name: 'Trees', description: 'Master traversals, BSTs, depth, paths and tree construction.',
    problems: [
      p('trees','inorder','Inorder Traversal','Easy','https://leetcode.com/problems/binary-tree-inorder-traversal/description/'),
      p('trees','preorder','Preorder Traversal','Easy','https://leetcode.com/problems/binary-tree-preorder-traversal/description/'),
      p('trees','postorder','Postorder Traversal','Easy','https://leetcode.com/problems/binary-tree-postorder-traversal/description/'),
      p('trees','level-order','Level Order','Medium','https://leetcode.com/problems/binary-tree-level-order-traversal/description/'),
      p('trees','zigzag','ZigZag Order','Medium','https://leetcode.com/problems/binary-tree-zigzag-level-order-traversal/description/'),
      p('trees','level-order-ii','Level Order II','Medium','https://leetcode.com/problems/binary-tree-level-order-traversal-ii/description/'),
      p('trees','invert','Invert Tree','Easy','https://leetcode.com/problems/invert-binary-tree/description/'),
      p('trees','symmetric','Symmetric Tree','Easy','https://leetcode.com/problems/symmetric-tree/description/'),
      p('trees','same-tree','Same Tree','Easy','https://leetcode.com/problems/same-tree/description/'),
      p('trees','subtree','Subtree of Another Tree','Easy','https://leetcode.com/problems/subtree-of-another-tree/description/'),
      p('trees','flip-equivalent','Flip Equivalent Tree','Medium','https://leetcode.com/problems/flip-equivalent-binary-trees/description/'),
      p('trees','lca','Lowest Common Ancestor of a Binary Tree','Medium','https://leetcode.com/problems/lowest-common-ancestor-of-a-binary-tree/description/'),
      p('trees','bst-search','Search in a Binary Search Tree','Easy','https://leetcode.com/problems/search-in-a-binary-search-tree/'),
      p('trees','lca-bst','LCA of BST','Medium','https://leetcode.com/problems/lowest-common-ancestor-of-a-binary-search-tree/description/'),
      p('trees','lca-deepest','LCA of Deepest Leaves','Medium','https://leetcode.com/problems/lowest-common-ancestor-of-deepest-leaves/description/'),
      p('trees','two-sum-bst','Two Sum IV','Easy','https://leetcode.com/problems/two-sum-iv-input-is-a-bst/description/'),
      p('trees','kth-bst','Kth Smallest Element in BST','Medium','https://leetcode.com/problems/kth-smallest-element-in-a-bst/description/'),
      p('trees','min-depth','Minimum Depth of Binary Tree','Easy','https://leetcode.com/problems/minimum-depth-of-binary-tree/description/'),
      p('trees','max-depth','Maximum Depth of Binary Tree','Easy','https://leetcode.com/problems/maximum-depth-of-binary-tree/description/'),
      p('trees','balanced','Balanced Binary Tree','Easy','https://leetcode.com/problems/balanced-binary-tree/description/'),
      p('trees','diameter','Diameter of Binary Tree','Easy','https://leetcode.com/problems/diameter-of-binary-tree/description/'),
      p('trees','complete','Check Completeness of Binary Tree','Medium','https://leetcode.com/problems/check-completeness-of-a-binary-tree/description/'),
      p('trees','validate-bst','Validate BST','Medium','https://leetcode.com/problems/validate-binary-search-tree/description/'),
      p('trees','recover-bst','Recover BST','Hard','https://leetcode.com/problems/recover-binary-search-tree/description/'),
      p('trees','path-sum','Path Sum','Easy','https://leetcode.com/problems/path-sum/description/'),
      p('trees','path-sum-ii','Path Sum II','Medium','https://leetcode.com/problems/path-sum-ii/'),
      p('trees','root-leaf-sum','Sum Root to Leaf Numbers','Medium','https://leetcode.com/problems/sum-root-to-leaf-numbers/description/'),
      p('trees','max-path-sum','Maximum Path Sum','Hard','https://leetcode.com/problems/binary-tree-maximum-path-sum/description/'),
      p('trees','construct-pre-in','Construct Tree from Preorder and Inorder','Medium','https://leetcode.com/problems/construct-binary-tree-from-preorder-and-inorder-traversal/description/'),
      p('trees','construct-post-in','Construct Tree from Postorder and Inorder','Medium','https://leetcode.com/problems/construct-binary-tree-from-inorder-and-postorder-traversal/description/'),
      p('trees','sorted-array-bst','Sorted Array to BST','Easy','https://leetcode.com/problems/convert-sorted-array-to-binary-search-tree/description/'),
    ],
  },
  {
    id: 'graphs', name: 'Graphs', description: 'Build graph representations and solve traversal, connectivity and cycle problems.',
    problems: [
      p('graphs','adjacency-list','Construct Adjacency List','Easy','https://www.geeksforgeeks.org/problems/print-adjacency-list-1587115620/1'),
      p('graphs','dfs','Graph DFS','Easy','https://www.geeksforgeeks.org/problems/depth-first-traversal-for-a-graph/1'),
      p('graphs','bfs','Graph BFS','Easy','https://www.geeksforgeeks.org/problems/bfs-traversal-of-graph/1'),
      p('graphs','islands','Number of Islands','Medium','https://leetcode.com/problems/number-of-islands/description/'),
      p('graphs','provinces','Number of Provinces','Medium','https://leetcode.com/problems/number-of-provinces/description/'),
      p('graphs','rotten-oranges','Rotten Oranges','Medium','https://leetcode.com/problems/rotting-oranges/'),
      p('graphs','cycle-undirected','Cycle Detection in Undirected Graph','Medium','https://www.geeksforgeeks.org/problems/detect-cycle-in-an-undirected-graph/1'),
      p('graphs','cycle-directed','Cycle Detection in Directed Graph','Medium','https://www.geeksforgeeks.org/problems/detect-cycle-in-a-directed-graph/1'),
      p('graphs','topological-sort','Topological Sort','Medium','https://www.geeksforgeeks.org/problems/topological-sort/1'),
      p('graphs','bipartite','Bipartite Graph / Graph Coloring','Medium','https://leetcode.com/problems/is-graph-bipartite/'),
    ],
  },
]
