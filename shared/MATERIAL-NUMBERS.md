# 教材番号の管理

初期 54 件は 2026-10-13 の公開一覧順で割り当て済み。番号は並べ替え・絞り込み・タイトル変更で変えない。削除した番号も再利用しない。

`material-numbers.json` が固定対応表。`key` は既存動画パスまたはツールの相対 URL。新しい教材には `nextNumber` を割り当て、この値を増やす。既存教材の URL を移す際も同じ番号を引き継ぐ。

対応表の変更時は `material-numbers.js` 内の materials を同期し、トップ一覧の data-material-number と No. バッジ、該当する explore / stats の副一覧も同じ番号にする。新しい教材 HTML には material-numbers.css と material-numbers.js を既存スクリプトより後に読み込む。検索は番号だけ・No. 009・教材番号9・9番などに対応する。

同一教材を別形式や別URLに置き換える場合も番号を変えない。`key` に公開一覧の現行URLを設定し、残す旧URLは同じ行の `aliases` 配列に記録する。旧URLに新しい番号や別の行を割り当てない。No. 011–015 は動画へ置き換え、旧ツールURLも同じ番号で引き続き表示する。
