mkdir resized_images  # Create a directory to store resized images
for file in *.jpg *.png *.jpeg; do
    convert "$file" -resize 200x200 "resized_images/$file"
done
